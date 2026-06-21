import { Type } from "lucide-react";
import { saveSiteIdentitySettingsAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isDatabaseAvailable } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function SiteSettingsPage({ searchParams }) {
  const [settings, databaseReady] = await Promise.all([getSiteSettings(), isDatabaseAvailable()]);
  const params = await searchParams;

  return (
    <>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Website identity</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Site settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Manage the brand text shown in public website headers and the footer.</p>
      </div>

      {!databaseReady && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">PostgreSQL is unavailable. Settings cannot be saved until the database is connected and migrated.</div>}
      {params?.saved && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Site settings saved.</div>}

      <form action={saveSiteIdentitySettingsAction} className="max-w-3xl">
        <fieldset disabled={!databaseReady}>
          <Card>
            <CardHeader>
              <div className="mb-3 grid h-11 w-11 place-items-center rounded-lg bg-emerald-100 text-emerald-700"><Type /></div>
              <CardTitle>Public brand title</CardTitle>
              <CardDescription>These two lines replace “RIVERS” and “RF CONTROL” across the public website.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brandTitle">Main title</Label>
                <Input id="brandTitle" name="brandTitle" defaultValue={settings.brandTitle || "RIVERS"} maxLength={40} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="brandSubtitle">Subtitle</Label>
                <Input id="brandSubtitle" name="brandSubtitle" defaultValue={settings.brandSubtitle || "RF CONTROL"} maxLength={60} required />
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6"><Button type="submit">Save site settings</Button></CardFooter>
          </Card>
        </fieldset>
      </form>
    </>
  );
}
