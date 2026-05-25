export function SetupNotice() {
  return (
    <div className="panel border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`,
      then run the SQL files in `supabase/` to connect the app to your project.
    </div>
  );
}
