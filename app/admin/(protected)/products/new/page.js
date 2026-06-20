import { createProductAction } from "@/app/admin/actions";
import { ProductForm } from "@/components/ProductForm";
import { getCategories } from "@/lib/products";
import { isDatabaseConfigured } from "@/lib/prisma";

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <>
      <div className="mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">New product</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Add product</h1><p className="mt-2 text-sm text-muted-foreground">Create a draft, add images and specifications, then publish when ready.</p></div>
      {!isDatabaseConfigured && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">The form is read-only in demo mode.</div>}
      <ProductForm action={createProductAction} categories={categories} databaseReady={isDatabaseConfigured} />
    </>
  );
}
