import { saveSettingsAction } from "@/app/actions";
import { SetupNotice } from "@/components/ui/SetupNotice";
import { SubmitButton } from "@/components/ui/SubmitButton";
import { businessName, cliftonRoute, daniyalDropLocations, daniyalPickupLocations, defaultCliftonPayment, defaultLinkRoadPayment, defaultPaymentInstructions, paymentInstructionsForDrop } from "@/lib/daniyal-transport";
import { requireRole } from "@/lib/auth-guards";
import { createClient } from "@/lib/supabase/server";
import { defaultReminderTemplate } from "@/lib/whatsapp/reminder";

export default async function SettingsPage() {
  await requireRole("admin");
  const supabase = await createClient();
  if (!supabase) return <main className="section"><SetupNotice /></main>;
  const { data: settings } = await supabase.from("settings").select("*").limit(1).maybeSingle();

  return (
    <main className="section">
      <form action={saveSettingsAction} className="panel mx-auto grid max-w-2xl gap-4 p-4">
        <h1 className="text-2xl font-bold">Settings</h1>
        <input name="id" type="hidden" value={settings?.id ?? ""} />
        <input name="business_name" type="hidden" value={settings?.business_name ?? businessName} />
        <input name="default_monthly_fee" type="hidden" value={settings?.default_monthly_fee ?? cliftonRoute.fees.both_side} />
        <input name="default_due_day" type="hidden" value={settings?.default_due_day ?? 10} />
        <input name="pickup_locations" type="hidden" value={settings?.pickup_locations ?? daniyalPickupLocations.join("\n")} />
        <input name="drop_locations" type="hidden" value={settings?.drop_locations ?? daniyalDropLocations.join("\n")} />
        <input name="payment_instructions" type="hidden" value={settings?.payment_instructions ?? defaultPaymentInstructions} />
        <section className="grid gap-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div>
            <h2 className="text-lg font-bold text-slate-950">Route payment details</h2>
            <p className="mt-1 text-sm text-slate-600">Customers will see payment details according to their selected route.</p>
          </div>
          <input name="clifton_payment_instructions" type="hidden" value={settings?.clifton_payment_instructions ?? paymentInstructionsForDrop(cliftonRoute.drop)} />
          <input name="link_road_payment_instructions" type="hidden" value={settings?.link_road_payment_instructions ?? paymentInstructionsForDrop("Ziauddin Link Road")} />
          <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3">
            <h3 className="font-bold text-slate-950">Clifton route</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2"><span className="label">Payment method</span><input className="field" defaultValue={settings?.clifton_payment_method ?? defaultCliftonPayment.method} name="clifton_payment_method" /></label>
              <label className="grid gap-2"><span className="label">Account title</span><input className="field" defaultValue={settings?.clifton_account_title ?? defaultCliftonPayment.accountTitle} name="clifton_account_title" /></label>
              <label className="grid gap-2"><span className="label">Bank / wallet name</span><input className="field" defaultValue={settings?.clifton_bank_name ?? defaultCliftonPayment.bankName} name="clifton_bank_name" /></label>
              <label className="grid gap-2"><span className="label">Account / number</span><input className="field" defaultValue={settings?.clifton_account_number ?? defaultCliftonPayment.accountNumber} name="clifton_account_number" /></label>
              <label className="grid gap-2 sm:col-span-2"><span className="label">Screenshot WhatsApp</span><input className="field" defaultValue={settings?.clifton_receipt_whatsapp ?? defaultCliftonPayment.receiptWhatsapp} name="clifton_receipt_whatsapp" /></label>
              <label className="grid gap-2 sm:col-span-2"><span className="label">Route notes / fees</span><textarea className="field" defaultValue={settings?.clifton_payment_note ?? defaultCliftonPayment.note} name="clifton_payment_note" rows={4} /></label>
            </div>
          </div>
          <div className="grid gap-3 rounded-lg border border-slate-200 bg-white p-3">
            <h3 className="font-bold text-slate-950">Link Road route</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2"><span className="label">Payment method</span><input className="field" defaultValue={settings?.link_road_payment_method ?? defaultLinkRoadPayment.method} name="link_road_payment_method" /></label>
              <label className="grid gap-2"><span className="label">Account title</span><input className="field" defaultValue={settings?.link_road_account_title ?? defaultLinkRoadPayment.accountTitle} name="link_road_account_title" /></label>
              <label className="grid gap-2"><span className="label">Bank / wallet name</span><input className="field" defaultValue={settings?.link_road_bank_name ?? defaultLinkRoadPayment.bankName} name="link_road_bank_name" /></label>
              <label className="grid gap-2"><span className="label">Account / number</span><input className="field" defaultValue={settings?.link_road_account_number ?? defaultLinkRoadPayment.accountNumber} name="link_road_account_number" /></label>
              <label className="grid gap-2 sm:col-span-2"><span className="label">Screenshot WhatsApp</span><input className="field" defaultValue={settings?.link_road_receipt_whatsapp ?? defaultLinkRoadPayment.receiptWhatsapp} name="link_road_receipt_whatsapp" /></label>
              <label className="grid gap-2 sm:col-span-2"><span className="label">Route notes / fees</span><textarea className="field" defaultValue={settings?.link_road_payment_note ?? defaultLinkRoadPayment.note} name="link_road_payment_note" rows={5} /></label>
            </div>
          </div>
        </section>
        <label className="grid gap-2"><span className="label">WhatsApp reminder template</span><textarea className="field" defaultValue={settings?.whatsapp_reminder_template ?? defaultReminderTemplate} name="whatsapp_reminder_template" rows={5} /></label>
        <SubmitButton>Save Settings</SubmitButton>
      </form>
    </main>
  );
}
