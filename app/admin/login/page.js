import { redirect } from "next/navigation";
import { loginAction } from "@/app/admin/actions";
import { isAdminAuthenticated } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const metadata = { title: "Admin login" };

export default async function LoginPage({ searchParams }) {
  if (await isAdminAuthenticated()) redirect("/admin/products");
  const params = await searchParams;
  const error = params?.error;
  return (
    <main className="grid min-h-screen place-items-center bg-slate-950 p-6">
      <Card className="w-full max-w-md border-white/10">
        <CardHeader><p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Rivers admin</p><CardTitle className="text-3xl">Product management</CardTitle><CardDescription>Sign in with the password configured in <code>ADMIN_PASSWORD</code>.</CardDescription></CardHeader>
        <CardContent>
          {error === "invalid" && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">Incorrect password.</p>}
          {error === "setup" && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">ADMIN_PASSWORD and AUTH_SECRET must be set.</p>}
          <form action={loginAction} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" required autoComplete="current-password" /></div>
            <Button className="w-full" type="submit">Sign in</Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
