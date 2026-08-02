import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { KNOWLEDGE_CATEGORIES } from "@/lib/knowledge";

export function ArticleForm({ action, article, databaseReady, products, storageReady = false }) {
  const selectedProductIds = new Set(article?.relatedProducts?.map((item) => item.productId) || []);

  return (
    <form action={action} className="max-w-5xl">
      <fieldset disabled={!databaseReady} className="space-y-6 disabled:opacity-60">
        <Card>
          <CardHeader><CardTitle>Article information</CardTitle><CardDescription>Core content, ownership and publishing controls.</CardDescription></CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field label="Title"><Input name="title" defaultValue={article?.title || ""} placeholder="433MHz vs 868MHz: How to Choose" required /></Field>
            <Field label="Slug"><Input name="slug" defaultValue={article?.slug || ""} placeholder="433mhz-vs-868mhz" pattern="[a-z0-9-]+" required /></Field>
            <Field label="Category">
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring" name="category" defaultValue={article?.category || KNOWLEDGE_CATEGORIES[0].value}>
                {KNOWLEDGE_CATEGORIES.map((category) => <option value={category.value} key={category.value}>{category.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring" name="status" defaultValue={article?.status || "DRAFT"}>
                <option value="DRAFT">Draft</option><option value="PUBLISHED">Published</option><option value="ARCHIVED">Archived</option>
              </select>
            </Field>
            <Field label="Author"><Input name="authorName" defaultValue={article?.authorName || "ANRIVERS Engineering Team"} required /></Field>
            <Field label="Technical reviewer"><Input name="reviewerName" defaultValue={article?.reviewerName || ""} placeholder="Optional reviewer name" /></Field>
            <div className="flex items-end pb-2"><label className="flex flex-row items-center gap-3 text-sm font-medium"><input className="h-4 w-4 accent-slate-950" name="featured" type="checkbox" defaultChecked={article?.featured} />Feature in Knowledge Center</label></div>
            <Field label="Summary" className="md:col-span-2"><Textarea name="excerpt" defaultValue={article?.excerpt || ""} placeholder="A concise answer-first summary for listings and search results." required /></Field>
            <Field label="Article body" className="md:col-span-2"><RichTextEditor name="content" defaultValue={article?.content || ""} ariaLabel="Article body" /></Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Cover and related products</CardTitle><CardDescription>Add one clear cover image and connect products that help readers act on the guide.</CardDescription></CardHeader>
          <CardContent className="space-y-6">
            <Field label="Cover image">
              <ImageUploader
                initialUrls={article?.coverImageUrl ? [article.coverImageUrl] : []}
                storageReady={storageReady}
                inputName="coverImageUrls"
                multiple={false}
                emptyLabel="暂无文章封面图"
              />
            </Field>
            <Field label="Cover image description"><Input name="coverImageAlt" defaultValue={article?.coverImageAlt || ""} placeholder="Describe the image for screen readers and image search" /></Field>
            <Field label="Related products" hint="Select only products directly relevant to this guide.">
              <div className="grid max-h-80 gap-2 overflow-y-auto rounded-lg border bg-slate-50 p-3 md:grid-cols-2">
                {products.length > 0 ? products.map((product) => (
                  <label className="flex flex-row items-start gap-3 rounded-md bg-white p-3 text-sm" key={product.id}>
                    <input className="mt-0.5 h-4 w-4 shrink-0 accent-slate-950" name="relatedProductIds" type="checkbox" value={product.id} defaultChecked={selectedProductIds.has(product.id)} />
                    <span><strong className="block font-medium">{product.name}</strong><small className="mt-1 block text-muted-foreground">{product.category?.name} · {product.modelNumber || "Custom model"}</small></span>
                  </label>
                )) : <p className="p-3 text-sm text-muted-foreground">No products are available yet.</p>}
              </div>
            </Field>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Search metadata</CardTitle><CardDescription>Optional overrides for search and social previews.</CardDescription></CardHeader>
          <CardContent className="grid gap-5 md:grid-cols-2">
            <Field label="SEO title"><Input name="seoTitle" defaultValue={article?.seoTitle || ""} maxLength={120} /></Field>
            <Field label="SEO description"><Textarea name="seoDescription" defaultValue={article?.seoDescription || ""} maxLength={320} /></Field>
          </CardContent>
          <CardFooter className="gap-3 border-t pt-6">
            <Button type="submit">{article ? "Save article" : "Create article"}</Button>
            <Button variant="outline" asChild><Link href="/admin/knowledge">Cancel</Link></Button>
          </CardFooter>
        </Card>
      </fieldset>
    </form>
  );
}

function Field({ label, hint, className = "", children }) {
  return <div className={`space-y-2 ${className}`}><Label>{label}</Label>{children}{hint && <p className="text-xs leading-5 text-muted-foreground">{hint}</p>}</div>;
}
