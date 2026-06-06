export function SetupNotice() {
  return (
    <div className="panel border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      <p className="font-bold">Supabase setup is incomplete.</p>
      <p className="mt-1">
        Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code>,
        then run <code>supabase/schema.sql</code>, <code>supabase/rls.sql</code>, and <code>supabase/storage.sql</code>.
      </p>
      <p className="mt-2">
        Also enable email/password auth in Supabase and keep email confirmation disabled for this phone-login app.
      </p>
    </div>
  );
}
