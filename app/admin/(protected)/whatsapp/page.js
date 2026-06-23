import { MessageCircle } from "lucide-react";
import { saveWhatsAppSettingsAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { isDatabaseAvailable } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function WhatsAppSettingsPage({ searchParams }) {
  const [settings, databaseReady] = await Promise.all([getSiteSettings(), isDatabaseAvailable()]);
  const params = await searchParams;

  return (
    <>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Contact channel</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">WhatsApp</h1>
        <p className="mt-2 text-sm text-muted-foreground">Control the WhatsApp button shown on every public product page.</p>
      </div>

      {!databaseReady && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">PostgreSQL is unavailable. Settings cannot be saved until the database is connected and migrated.</div>}
      {params?.saved && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">WhatsApp settings saved.</div>}

      <form action={saveWhatsAppSettingsAction} className="max-w-3xl">
        <fieldset disabled={!databaseReady}>
          <Card>
            <CardHeader>
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><MessageCircle /></div>
              <CardTitle>WhatsApp chat button</CardTitle>
              <CardDescription>Insert the current product name with <code>{"{product}"}</code> and its page link with <code>{"{url}"}</code>.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <label className="flex items-center justify-between gap-6 rounded-lg border bg-slate-50 p-4">
                <span><span className="block text-sm font-medium">Show WhatsApp button</span><span className="mt-1 block text-xs font-normal text-muted-foreground">Enable the contact button on public product pages.</span></span>
                <input className="h-5 w-5 accent-emerald-600" type="checkbox" name="whatsappEnabled" defaultChecked={settings.whatsappEnabled} />
              </label>

              <div className="space-y-2">
                <Label htmlFor="whatsappNumber">WhatsApp number</Label>
                <Input id="whatsappNumber" name="whatsappNumber" defaultValue={settings.whatsappNumber} placeholder="8613812345678" inputMode="tel" />
                <p className="text-xs leading-5 text-muted-foreground">Optional. Include the country code and omit punctuation. Without a number, WhatsApp asks the visitor to choose a contact.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsappMessageTemplate">Default message</Label>
                <Textarea id="whatsappMessageTemplate" name="whatsappMessageTemplate" className="min-h-32" defaultValue={settings.whatsappMessageTemplate} />
                <p className="text-xs leading-5 text-muted-foreground">Use <code>{"{product}"}</code> for the product name and <code>{"{url}"}</code> for its page link. If <code>{"{url}"}</code> is omitted, the link is appended automatically.</p>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6"><Button type="submit">Save WhatsApp settings</Button></CardFooter>
          </Card>
        </fieldset>
      </form>
    </>
  );
}
