insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do update set public = false;

create policy "customers upload own payment screenshots"
on storage.objects for insert
with check (
  bucket_id = 'payment-proofs'
  and exists (
    select 1 from public.customers c
    where c.user_id = auth.uid()
    and (storage.foldername(name))[1] = c.id::text
  )
);

create policy "customers read own payment screenshots"
on storage.objects for select
using (
  bucket_id = 'payment-proofs'
  and exists (
    select 1 from public.customers c
    where c.user_id = auth.uid()
    and (storage.foldername(name))[1] = c.id::text
  )
);

create policy "admins read payment screenshots"
on storage.objects for select
using (bucket_id = 'payment-proofs' and public.is_admin());
