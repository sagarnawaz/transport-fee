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
  service_days text not null default 'mon_to_sat' check (service_days in ('mon_to_fri', 'mon_to_sat')),
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
  business_name text not null default 'Daniyal Transport',
  default_monthly_fee numeric not null default 12000,
  default_due_day int not null default 10 check (default_due_day between 1 and 28),
  pickup_locations text not null default 'Gulshan-e-Hadeed
Steel Town
Razzaqabad
Bhens Colony
Manzil Pump
Quaidabad
Malir
Korangi Industrial Area
Qayyumabad
Defence (DHA)
2 Talwar
3 Talwar
Park Towers
Dolmen Mall
Abdullah Shah Ghazi
South City Hospital
Ziauddin Hospital Clifton
Landhi to Link Road Ziauddin
Landhi
Shah Latif Town
Port Qasim',
  drop_locations text not null default 'Clifton
Ziauddin Link Road',
  clifton_payment_instructions text not null default 'Payment for Clifton route
Bank Title: Israr Muhammad
Meezan Bank number: 1047 0109 2680 26
Double side Mon-Fri: Rs. 11,500
Double side Mon-Sat: Rs. 12,000
Single side: Rs. 6,500
Pay before the 10th and send receipt screenshot on WhatsApp: 0301-2589603.',
  clifton_payment_method text not null default 'Bank Transfer',
  clifton_account_title text not null default 'Israr Muhammad',
  clifton_bank_name text not null default 'Meezan Bank',
  clifton_account_number text not null default '1047 0109 2680 26',
  clifton_receipt_whatsapp text not null default '0301-2589603',
  clifton_payment_note text not null default 'Double side Mon-Fri: Rs. 11,500
Double side Mon-Sat: Rs. 12,000
Single side: Rs. 6,500
Pay before the 10th.',
  link_road_payment_instructions text not null default 'Payment for Link Road route
Bank Title: Israr Muhammad
Easy Paisa number: 0301-2589603
AC Van
Gulshan-e-Hadeed / Steel Town: Rs. 12,000
All other pickup locations: Rs. 16,000
Note: Fees will be charged during the leave of the University.',
  link_road_payment_method text not null default 'EasyPaisa',
  link_road_account_title text not null default 'Israr Muhammad',
  link_road_bank_name text not null default 'EasyPaisa',
  link_road_account_number text not null default '0301-2589603',
  link_road_receipt_whatsapp text not null default '0301-2589603',
  link_road_payment_note text not null default 'AC Van
Gulshan-e-Hadeed / Steel Town: Rs. 12,000
All other pickup locations: Rs. 16,000
Fees will be charged during the leave of the University.',
  whatsapp_reminder_template text not null default 'Assalam o Alaikum {customer_name}, your transport fee for {month} {year} is pending. Amount: Rs. {pending_amount}. Customer ID: {customer_id}. Please make payment as soon as possible. Thank you.',
  payment_instructions text not null default 'Payment for Clifton route
Bank Title: Israr Muhammad
Meezan Bank number: 1047 0109 2680 26
Double side Mon-Fri: Rs. 11,500
Double side Mon-Sat: Rs. 12,000
Single side: Rs. 6,500
Pay before the 10th and send receipt screenshot on WhatsApp: 0301-2589603.

Payment for Link Road route
Bank Title: Israr Muhammad
Easy Paisa number: 0301-2589603
AC Van
Gulshan-e-Hadeed / Steel Town: Rs. 12,000
All other pickup locations: Rs. 16,000
Note: Fees will be charged during the leave of the University.',
  created_at timestamptz not null default now()
);

alter table public.customers alter column whatsapp_number drop not null;
alter table public.customers add column if not exists ride_type text not null default 'both_side';
alter table public.customers drop constraint if exists customers_ride_type_check;
alter table public.customers add constraint customers_ride_type_check check (ride_type in ('both_side', 'one_side'));
alter table public.customers add column if not exists service_days text not null default 'mon_to_sat';
alter table public.customers drop constraint if exists customers_service_days_check;
alter table public.customers add constraint customers_service_days_check check (service_days in ('mon_to_fri', 'mon_to_sat'));
create unique index if not exists profiles_phone_unique on public.profiles (phone) where phone is not null;
create unique index if not exists customers_phone_unique on public.customers (phone);
alter table public.settings add column if not exists default_monthly_fee numeric not null default 12000;
alter table public.settings add column if not exists pickup_locations text not null default 'Gulshan-e-Hadeed';
alter table public.settings add column if not exists drop_locations text not null default 'Clifton';
alter table public.settings add column if not exists clifton_payment_instructions text not null default 'Payment for Clifton route
Bank Title: Israr Muhammad
Meezan Bank number: 1047 0109 2680 26
Double side Mon-Fri: Rs. 11,500
Double side Mon-Sat: Rs. 12,000
Single side: Rs. 6,500
Pay before the 10th and send receipt screenshot on WhatsApp: 0301-2589603.';
alter table public.settings add column if not exists clifton_payment_method text not null default 'Bank Transfer';
alter table public.settings add column if not exists clifton_account_title text not null default 'Israr Muhammad';
alter table public.settings add column if not exists clifton_bank_name text not null default 'Meezan Bank';
alter table public.settings add column if not exists clifton_account_number text not null default '1047 0109 2680 26';
alter table public.settings add column if not exists clifton_receipt_whatsapp text not null default '0301-2589603';
alter table public.settings add column if not exists clifton_payment_note text not null default 'Double side Mon-Fri: Rs. 11,500
Double side Mon-Sat: Rs. 12,000
Single side: Rs. 6,500
Pay before the 10th.';
alter table public.settings add column if not exists link_road_payment_instructions text not null default 'Payment for Link Road route
Bank Title: Israr Muhammad
Easy Paisa number: 0301-2589603
AC Van
Gulshan-e-Hadeed / Steel Town: Rs. 12,000
All other pickup locations: Rs. 16,000
Note: Fees will be charged during the leave of the University.';
alter table public.settings add column if not exists link_road_payment_method text not null default 'EasyPaisa';
alter table public.settings add column if not exists link_road_account_title text not null default 'Israr Muhammad';
alter table public.settings add column if not exists link_road_bank_name text not null default 'EasyPaisa';
alter table public.settings add column if not exists link_road_account_number text not null default '0301-2589603';
alter table public.settings add column if not exists link_road_receipt_whatsapp text not null default '0301-2589603';
alter table public.settings add column if not exists link_road_payment_note text not null default 'AC Van
Gulshan-e-Hadeed / Steel Town: Rs. 12,000
All other pickup locations: Rs. 16,000
Fees will be charged during the leave of the University.';

insert into public.settings (business_name)
select 'Daniyal Transport'
where not exists (select 1 from public.settings);

update public.settings
set default_monthly_fee = 12000
where default_monthly_fee in (0, 12500);

update public.settings
set clifton_payment_note = 'Double side Mon-Fri: Rs. 11,500
Double side Mon-Sat: Rs. 12,000
Single side: Rs. 6,500
Pay before the 10th.'
where clifton_payment_note like '%12,500%'
   or clifton_payment_note like '%7,500%';

update public.settings
set clifton_payment_instructions = 'Payment for Clifton route
Bank Title: Israr Muhammad
Meezan Bank number: 1047 0109 2680 26
Double side Mon-Fri: Rs. 11,500
Double side Mon-Sat: Rs. 12,000
Single side: Rs. 6,500
Pay before the 10th and send receipt screenshot on WhatsApp: 0301-2589603.'
where clifton_payment_instructions like '%12,500%'
   or clifton_payment_instructions like '%7,500%';

update public.settings
set link_road_payment_note = 'AC Van
Gulshan-e-Hadeed / Steel Town: Rs. 12,000
All other pickup locations: Rs. 16,000
Fees will be charged during the leave of the University.'
where link_road_payment_note like '%13,000%'
   or link_road_payment_note like '%15,000%'
   or link_road_payment_note like '%Quaidabad: Rs. 16,000%';

update public.settings
set link_road_payment_instructions = 'Payment for Link Road route
Bank Title: Israr Muhammad
Easy Paisa number: 0301-2589603
AC Van
Gulshan-e-Hadeed / Steel Town: Rs. 12,000
All other pickup locations: Rs. 16,000
Note: Fees will be charged during the leave of the University.'
where link_road_payment_instructions like '%13,000%'
   or link_road_payment_instructions like '%15,000%'
   or link_road_payment_instructions like '%Quaidabad: Rs. 16,000%';

update public.settings
set payment_instructions = 'Payment for Clifton route
Bank Title: Israr Muhammad
Meezan Bank number: 1047 0109 2680 26
Double side Mon-Fri: Rs. 11,500
Double side Mon-Sat: Rs. 12,000
Single side: Rs. 6,500
Pay before the 10th and send receipt screenshot on WhatsApp: 0301-2589603.

Payment for Link Road route
Bank Title: Israr Muhammad
Easy Paisa number: 0301-2589603
AC Van
Gulshan-e-Hadeed / Steel Town: Rs. 12,000
All other pickup locations: Rs. 16,000
Note: Fees will be charged during the leave of the University.'
where payment_instructions like '%12,500%'
   or payment_instructions like '%7,500%'
   or payment_instructions like '%13,000%'
   or payment_instructions like '%15,000%'
   or payment_instructions like '%Quaidabad: Rs. 16,000%';

update public.customers
set monthly_fee = case
  when drop_address = 'Ziauddin Link Road' and pickup_address in ('Gulshan-e-Hadeed', 'Steel Town') then 12000
  when drop_address = 'Ziauddin Link Road' then 16000
  when drop_address <> 'Ziauddin Link Road' and ride_type = 'one_side' then 6500
  when drop_address <> 'Ziauddin Link Road' and service_days = 'mon_to_fri' then 11500
  when drop_address <> 'Ziauddin Link Road' then 12000
  else monthly_fee
end
where status in ('pending', 'active')
  and (
    monthly_fee in (7500, 9000, 12500, 13000, 15000)
    or drop_address <> 'Ziauddin Link Road'
    or drop_address = 'Ziauddin Link Road'
  );

update public.monthly_fee_records f
set fee_amount = c.monthly_fee
from public.customers c
where f.customer_id = c.id
  and c.monthly_fee is not null
  and f.status <> 'paid'
  and make_date(f.year, f.month, 1) >= date_trunc('month', current_date)::date
  and f.fee_amount <> c.monthly_fee;

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
  p_route_id uuid,
  p_service_days text default 'mon_to_sat',
  p_van_number text default '',
  p_customer_type text default 'new'
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
  v_ride_type text := coalesce(nullif(p_ride_type, ''), 'both_side');
  v_service_days text := coalesce(nullif(p_service_days, ''), 'mon_to_sat');
  v_customer_fee numeric := 0;
  v_drop_address text := trim(p_drop_address);
  v_pickup_address text := trim(p_pickup_address);
  v_route_note text := 'Clifton route';
  v_van_number text := nullif(trim(p_van_number), '');
  v_due_day int := 10;
  v_due_date date;
  v_days_in_month int;
  v_remaining_days int;
  v_first_month_fee numeric := 0;
  v_customer_type text := coalesce(nullif(trim(p_customer_type), ''), 'new');
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'Unauthorized';
  end if;

  if v_ride_type not in ('both_side', 'one_side') then
    raise exception 'Invalid ride type';
  end if;

  if v_service_days not in ('mon_to_fri', 'mon_to_sat') then
    raise exception 'Invalid service days';
  end if;

  if v_drop_address = 'Ziauddin Link Road' then
    v_route_note := 'Ziauddin Link Road AC Van';
    v_ride_type := 'both_side';
    v_service_days := 'mon_to_sat';
    v_customer_fee := case
      when v_pickup_address in ('Gulshan-e-Hadeed', 'Steel Town') then 12000
      when v_pickup_address in ('Landhi', 'Shah Latif Town', 'Razzaqabad', 'Port Qasim', 'Bhens Colony', 'Quaidabad') then 16000
      else 0
    end;
  else
    v_route_note := 'Gulshan-e-Hadeed to Clifton';
    v_customer_fee := case
      when v_ride_type = 'one_side' then 6500
      when v_service_days = 'mon_to_fri' then 11500
      else 12000
    end;
  end if;

  if v_customer_fee <= 0 then
    raise exception 'Invalid route fee';
  end if;

  if v_customer_type not in ('new', 'existing') then
    raise exception 'Invalid customer type';
  end if;

  select coalesce(default_due_day, 10)
  into v_due_day
  from public.settings
  order by created_at
  limit 1;

  v_due_day := least(greatest(coalesce(v_due_day, 10), 1), 28);
  v_due_date := make_date(v_year, v_month, v_due_day);
  v_days_in_month := extract(day from (date_trunc('month', current_date)::date + interval '1 month - 1 day'))::int;
  v_remaining_days := v_days_in_month - extract(day from current_date)::int + 1;
  v_first_month_fee := case
    when v_customer_type = 'existing' then v_customer_fee
    else round((v_customer_fee / v_days_in_month) * v_remaining_days)
  end;
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
    service_days,
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
    v_pickup_address,
    v_drop_address,
    v_ride_type,
    v_service_days,
    p_route_id,
    v_customer_fee,
    'active',
    current_date,
    'Auto registered - ' || v_route_note || coalesce(' - Van: ' || v_van_number, '') || ' - Service: ' || replace(v_service_days, '_', '-') || ' - Type: ' || v_customer_type
  )
  returning id into v_customer_id;

  insert into public.monthly_fee_records (customer_id, month, year, fee_amount, paid_amount, status, due_date)
  values (v_customer_id, v_month, v_year, v_first_month_fee, 0, 'unpaid', v_due_date)
  on conflict (customer_id, month, year) do nothing;

  return v_customer_id;
end;
$$;

update public.monthly_fee_records
set due_date = make_date(year, month, least(greatest(coalesce((select default_due_day from public.settings order by created_at limit 1), 10), 1), 28))
where due_date is null
   or due_date <> make_date(year, month, least(greatest(coalesce((select default_due_day from public.settings order by created_at limit 1), 10), 1), 28));
