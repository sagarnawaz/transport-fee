create extension if not exists "pgcrypto";

create sequence if not exists public.customer_code_seq start 1;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  full_name text,
  phone text,
  whatsapp_number text,
  created_at timestamptz not null default now()
);

create table if not exists public.routes (
  id uuid primary key default gen_random_uuid(),
  route_name text not null,
  driver_name text,
  vehicle_number text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  customer_code text unique,
  full_name text not null,
  guardian_name text,
  phone text not null,
  whatsapp_number text,
  pickup_address text not null,
  drop_address text not null,
  ride_type text not null default 'both_side' check (ride_type in ('both_side', 'one_side')),
  route_id uuid references public.routes(id) on delete set null,
  monthly_fee numeric,
  status text not null default 'pending' check (status in ('pending', 'active', 'rejected', 'inactive')),
  joining_date date,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_fee_records (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  month int not null check (month between 1 and 12),
  year int not null check (year between 2000 and 2100),
  fee_amount numeric not null,
  paid_amount numeric not null default 0,
  status text not null default 'unpaid' check (status in ('unpaid', 'pending_verification', 'paid', 'partial', 'rejected')),
  due_date date,
  created_at timestamptz not null default now(),
  unique (customer_id, month, year)
);

create table if not exists public.payment_proofs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  fee_record_id uuid not null references public.monthly_fee_records(id) on delete cascade,
  amount numeric not null,
  payment_method text not null check (payment_method in ('Cash', 'Bank Transfer', 'Easypaisa', 'JazzCash', 'Other')),
  transaction_id text,
  payment_date date not null,
  screenshot_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  submitted_at timestamptz not null default now(),
  verified_at timestamptz,
  verified_by uuid references auth.users(id)
);

create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  business_name text not null default 'Transport Fee Manager',
  default_monthly_fee numeric not null default 12000,
  default_due_day int not null default 10 check (default_due_day between 1 and 28),
  pickup_locations text not null default 'School Campus',
  drop_locations text not null default 'Home Stop',
  whatsapp_reminder_template text not null default 'Assalam o Alaikum {customer_name}, your transport fee for {month} {year} is pending. Amount: Rs. {pending_amount}. Customer ID: {customer_id}. Please make payment as soon as possible. Thank you.',
  payment_instructions text not null default 'Pay by cash, bank transfer, Easypaisa, JazzCash, or bank transfer, then submit your screenshot and transaction ID here.',
  created_at timestamptz not null default now()
);

alter table public.customers alter column whatsapp_number drop not null;
alter table public.customers add column if not exists ride_type text not null default 'both_side';
alter table public.customers drop constraint if exists customers_ride_type_check;
alter table public.customers add constraint customers_ride_type_check check (ride_type in ('both_side', 'one_side'));
create unique index if not exists profiles_phone_unique on public.profiles (phone) where phone is not null;
create unique index if not exists customers_phone_unique on public.customers (phone);
alter table public.settings add column if not exists default_monthly_fee numeric not null default 12000;
alter table public.settings add column if not exists pickup_locations text not null default 'School Campus';
alter table public.settings add column if not exists drop_locations text not null default 'Home Stop';

insert into public.settings (business_name)
select 'Transport Fee Manager'
where not exists (select 1 from public.settings);

update public.settings
set default_monthly_fee = 12000
where default_monthly_fee = 0;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.mark_fee_pending_after_proof()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.monthly_fee_records
  set status = 'pending_verification'
  where id = new.fee_record_id
    and customer_id = new.customer_id
    and status in ('unpaid', 'partial', 'rejected');
  return new;
end;
$$;

drop trigger if exists payment_proof_sets_pending on public.payment_proofs;
create trigger payment_proof_sets_pending
after insert on public.payment_proofs
for each row
when (new.status = 'pending')
execute function public.mark_fee_pending_after_proof();

create or replace function public.register_customer_profile(
  p_user_id uuid,
  p_full_name text,
  p_phone text,
  p_guardian_name text,
  p_pickup_address text,
  p_drop_address text,
  p_ride_type text,
  p_route_id uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid;
  v_customer_code text;
  v_month int := extract(month from current_date)::int;
  v_year int := extract(year from current_date)::int;
  v_default_fee numeric := 0;
  v_ride_type text := coalesce(nullif(p_ride_type, ''), 'both_side');
  v_customer_fee numeric := 0;
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Unauthorized';
  end if;

  select coalesce(default_monthly_fee, 0)
  into v_default_fee
  from public.settings
  order by created_at asc
  limit 1;

  if v_ride_type not in ('both_side', 'one_side') then
    raise exception 'Invalid ride type';
  end if;

  v_customer_fee := case when v_ride_type = 'one_side' then v_default_fee / 2 else v_default_fee end;

  v_customer_code := 'CUS-' || lpad(nextval('public.customer_code_seq')::text, 5, '0');

  insert into public.profiles (id, role, full_name, phone, whatsapp_number)
  values (p_user_id, 'customer', nullif(trim(p_full_name), ''), regexp_replace(p_phone, '\D', '', 'g'), null)
  on conflict (id) do update
  set full_name = excluded.full_name,
      phone = excluded.phone;

  insert into public.customers (
    user_id,
    customer_code,
    full_name,
    guardian_name,
    phone,
    whatsapp_number,
    pickup_address,
    drop_address,
    ride_type,
    route_id,
    monthly_fee,
    status,
    joining_date,
    notes
  )
  values (
    p_user_id,
    v_customer_code,
    trim(p_full_name),
    nullif(trim(p_guardian_name), ''),
    regexp_replace(p_phone, '\D', '', 'g'),
    null,
    trim(p_pickup_address),
    trim(p_drop_address),
    v_ride_type,
    p_route_id,
    v_customer_fee,
    'active',
    current_date,
    'Auto registered'
  )
  returning id into v_customer_id;

  insert into public.monthly_fee_records (customer_id, month, year, fee_amount, paid_amount, status, due_date)
  values (v_customer_id, v_month, v_year, v_customer_fee, 0, 'unpaid', current_date)
  on conflict (customer_id, month, year) do nothing;

  return v_customer_id;
end;
$$;
