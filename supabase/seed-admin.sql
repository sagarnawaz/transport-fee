-- 1. Register the admin once from the app's customer registration screen.
-- 2. Replace the phone below with that registered user's phone number.
-- 3. Run this SQL once in Supabase SQL Editor.

insert into public.profiles (id, role, full_name, phone)
select id, 'admin', coalesce(raw_user_meta_data->>'full_name', 'Admin'), '03000000000'
from auth.users
where email = '03000000000@transport.local'
on conflict (id) do update
set role = 'admin',
    phone = '03000000000',
    full_name = coalesce(public.profiles.full_name, excluded.full_name);
