import { saveSettingsAction } from "@/app/actions";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { createClient } from "@/lib/supabase/server";
import { defaultReminderTemplate } from "@/lib/whatsapp/reminder";

export default async function SettingsPage() {
  const supabase = await createClient();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const { data: settings } = await supabase.from("settings").select("*").limit(1).maybeSingle();

  return (
    <main className="section">
      <form action={saveSettingsAction} className="panel mx-auto grid max-w-2xl gap-4 p-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <input name="id" type="hidden" value={settings?.id ?? ""} />
        <label className="grid gap-2"><span className="label">Business name</span><input className="field" defaultValue={settings?.business_name ?? "Transport Fee Manager"} name="business_name" required /></label>
        <label className="grid gap-2"><span className="label">Default monthly fee</span><input className="field" defaultValue={settings?.default_monthly_fee ?? 12000} min={0} name="default_monthly_fee" required type="number" /></label>
        <label className="grid gap-2"><span className="label">Default due day</span><input className="field" defaultValue={settings?.default_due_day ?? 10} max={28} min={1} name="default_due_day" type="number" /></label>
        <label className="grid gap-2"><span className="label">Pickup locations</span><textarea className="field" defaultValue={settings?.pickup_locations ?? "School Campus"} name="pickup_locations" rows={4} /></label>
        <label className="grid gap-2"><span className="label">Drop off locations</span><textarea className="field" defaultValue={settings?.drop_locations ?? "Home Stop"} name="drop_locations" rows={4} /></label>
        <label className="grid gap-2"><span className="label">Payment instructions</span><textarea className="field" defaultValue={settings?.payment_instructions ?? "Pay by cash, bank transfer, Easypaisa, or JazzCash, then submit proof here."} name="payment_instructions" rows={4} /></label>
        <label className="grid gap-2"><span className="label">WhatsApp reminder template</span><textarea className="field" defaultValue={settings?.whatsapp_reminder_template ?? defaultReminderTemplate} name="whatsapp_reminder_template" rows={5} /></label>
        <SubmitButton>Save Settings</SubmitButton>
      </form>
    </main>
  );
}
