alter table public.profiles enable row level security;
alter table public.routes enable row level security;
alter table public.customers enable row level security;
alter table public.monthly_fee_records enable row level security;
alter table public.payment_proofs enable row level security;
alter table public.settings enable row level security;

create policy "admins manage profiles" on public.profiles for all using (public.is_admin()) with check (public.is_admin());
create policy "users read own profile" on public.profiles for select using (id = auth.uid());
create policy "users insert own profile" on public.profiles for insert with check (id = auth.uid());

create policy "admins manage routes" on public.routes for all using (public.is_admin()) with check (public.is_admin());
create policy "customers read routes" on public.routes for select using (auth.uid() is not null);

create policy "admins manage customers" on public.customers for all using (public.is_admin()) with check (public.is_admin());
create policy "customers read own customer" on public.customers for select using (user_id = auth.uid());
create policy "customers create own pending customer" on public.customers
  for insert with check (user_id = auth.uid() and status = 'pending' and monthly_fee is null and customer_code is null);

create policy "admins manage fee records" on public.monthly_fee_records for all using (public.is_admin()) with check (public.is_admin());
create policy "customers read own fee records" on public.monthly_fee_records
  for select using (exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()));

create policy "admins manage payment proofs" on public.payment_proofs for all using (public.is_admin()) with check (public.is_admin());
create policy "customers read own payment proofs" on public.payment_proofs
  for select using (exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid()));
create policy "customers create pending payment proofs only" on public.payment_proofs
  for insert with check (
    status = 'pending'
    and exists (select 1 from public.customers c where c.id = customer_id and c.user_id = auth.uid())
    and exists (
      select 1 from public.monthly_fee_records f
      where f.id = fee_record_id
      and f.customer_id = payment_proofs.customer_id
      and f.status in ('unpaid', 'partial', 'rejected')
    )
  );

create policy "admins manage settings" on public.settings for all using (public.is_admin()) with check (public.is_admin());
create policy "authenticated read settings" on public.settings for select using (auth.uid() is not null);
