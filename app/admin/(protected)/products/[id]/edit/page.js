import { notFound } from "next/navigation";
import { updateProductAction } from "@/app/admin/actions";
import { ProductForm } from "@/components/ProductForm";
import { getCategories, getProductById } from "@/lib/products";
import { isDatabaseConfigured } from "@/lib/prisma";
import { isR2Configured } from "@/lib/r2";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params, searchParams }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getProductById(id), getCategories()]);
  if (!product) notFound();
  const query = await searchParams;
  return (
    <>
      <div className="mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Edit product</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{product.name}</h1><p className="mt-2 text-sm text-muted-foreground">Update catalogue content, images, specifications and publishing status.</p></div>
      {!isDatabaseConfigured && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">This demo product is read-only.</div>}
      {query?.saved && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Product changes saved.</div>}
      {query?.created && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Product created successfully.</div>}
      <ProductForm action={updateProductAction.bind(null, id)} categories={categories} product={product} databaseReady={isDatabaseConfigured} storageReady={isR2Configured} />
    </>
  );
}
