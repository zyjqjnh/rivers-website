import { notFound } from "next/navigation";
import { updateCategoryAction } from "@/app/admin/actions";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { getCategoryById } from "@/lib/products";
import { isDatabaseAvailable } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({ params, searchParams }) {
  const { id } = await params;
  const [category, databaseReady] = await Promise.all([getCategoryById(id), isDatabaseAvailable()]);
  if (!category) notFound();
  const query = await searchParams;

  return (
    <>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Edit category</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{category.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">Update its public name, URL slug, description and display order.</p>
      </div>
      {!databaseReady && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">This category is read-only while PostgreSQL is unavailable.</div>}
      {query?.saved && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Category changes saved.</div>}
      {query?.created && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Category created successfully.</div>}
      {query?.error === "slug" && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">That slug is already in use. Choose a unique slug.</div>}
      {query?.error === "validation" && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">Check the category fields and try again.</div>}
      <CategoryForm action={updateCategoryAction.bind(null, id)} category={category} databaseReady={databaseReady} />
    </>
  );
}
