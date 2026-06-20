import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CategoryForm({ action, category, databaseReady }) {
  return (
    <form action={action} className="max-w-3xl">
      <fieldset disabled={!databaseReady} className="disabled:opacity-60">
        <Card>
          <CardHeader>
            <CardTitle>Category information</CardTitle>
            <CardDescription>Categories appear in the public product menu and catalogue filters.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field label="Name">
              <Input name="name" defaultValue={category?.name || ""} placeholder="Remote Controllers" required />
            </Field>
            <Field label="Slug" hint="Lowercase letters, numbers and hyphens only.">
              <Input name="slug" defaultValue={category?.slug || ""} placeholder="remote-controllers" pattern="[a-z0-9-]+" required />
            </Field>
            <Field label="Display order">
              <Input name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} min="0" step="1" required />
            </Field>
            <Field label="Description" className="md:col-span-2">
              <Textarea name="description" defaultValue={category?.description || ""} placeholder="Handheld and industrial RF transmitters." />
            </Field>
          </CardContent>
          <CardFooter className="gap-3 border-t pt-6">
            <Button type="submit">{category ? "Save category" : "Create category"}</Button>
            <Button variant="outline" asChild><Link href="/admin/categories">Cancel</Link></Button>
          </CardFooter>
        </Card>
      </fieldset>
    </form>
  );
}

function Field({ label, hint, className = "", children }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <Label>{label}</Label>
      {children}
      {hint && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}
    </div>
  );
}
