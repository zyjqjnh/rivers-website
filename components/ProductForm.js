import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { isR2Configured } from "@/lib/r2";

export function ProductForm({ action, categories, product, databaseReady }) {
  const imageUrls = product?.images?.map((image) => image.url) || [];
  const specifications = product?.specifications?.map((spec) => `${spec.label}: ${spec.value}`).join("\n") || "";

  return (
    <form action={action} className="max-w-5xl">
      <fieldset disabled={!databaseReady} className="space-y-6 disabled:opacity-60">
        <Card>
          <CardHeader><CardTitle>Product information</CardTitle><CardDescription>Core catalogue content and publishing controls.</CardDescription></CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field label="Name"><Input name="name" defaultValue={product?.name} placeholder="12-Key Long Range Industrial Remote" required /></Field>
            <Field label="Slug"><Input name="slug" defaultValue={product?.slug} placeholder="12-key-long-range-industrial-remote" pattern="[a-z0-9-]+" required /></Field>
            <Field label="Model number"><Input name="modelNumber" defaultValue={product?.modelNumber || ""} placeholder="RIV-TX12" /></Field>
            <Field label="Category"><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring" name="categoryId" defaultValue={product?.categoryId || categories[0]?.id} required>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></Field>
            <Field label="Status"><select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring" name="status" defaultValue={product?.status || "DRAFT"}><option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option></select></Field>
            <div className="flex items-end pb-2"><label className="flex items-center gap-3 text-sm font-medium"><input className="h-4 w-4 accent-slate-950" name="featured" type="checkbox" defaultChecked={product?.featured} />Feature on homepage</label></div>
            <Field label="Short description" className="md:col-span-2"><Textarea name="shortDescription" defaultValue={product?.shortDescription || ""} required /></Field>
            <Field label="Full description" className="md:col-span-2"><RichTextEditor name="description" defaultValue={product?.description || ""} /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Media and specifications</CardTitle><CardDescription>Upload and arrange product images, then add one technical specification per line.</CardDescription></CardHeader>
          <CardContent className="space-y-5">
            <Field label="Product images"><ImageUploader initialUrls={imageUrls} storageReady={isR2Configured} /></Field>
            <Field label="Specifications" hint={<>Use <code>Label: Value</code> format.</>}><Textarea className="min-h-36" name="specifications" defaultValue={specifications} placeholder={"Frequency: 433.92 MHz\nVoltage: DC 12V\nChannels: 4"} /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Search metadata</CardTitle><CardDescription>Optional title and description overrides for search engines.</CardDescription></CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field label="SEO title"><Input name="seoTitle" defaultValue={product?.seoTitle || ""} /></Field>
            <Field label="SEO description"><Input name="seoDescription" defaultValue={product?.seoDescription || ""} /></Field>
          </CardContent>
          <CardFooter className="gap-3 border-t pt-6">
            <Button type="submit">{product ? "Save product" : "Create product"}</Button>
            <Button variant="outline" asChild><Link href="/admin/products">Cancel</Link></Button>
          </CardFooter>
        </Card>
      </fieldset>
    </form>
  );
}

function Field({ label, hint, className = "", children }) {
  return <div className={`space-y-2 ${className}`}><Label>{label}</Label>{children}{hint && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}</div>;
}
