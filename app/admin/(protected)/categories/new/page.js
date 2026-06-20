import { createCategoryAction } from "@/app/admin/actions";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { isDatabaseAvailable } from "@/lib/prisma";

export default async function NewCategoryPage({ searchParams }) {
  const databaseReady = await isDatabaseAvailable();
  const query = await searchParams;
  return (
    <>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">New category</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Add category</h1>
        <p className="mt-2 text-sm text-muted-foreground">Create a catalogue group for products and public navigation.</p>
      </div>
      {!databaseReady && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">The form is read-only while PostgreSQL is unavailable.</div>}
      {query?.error === "slug" && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">That slug is already in use. Choose a unique slug.</div>}
      {query?.error === "validation" && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">Check the category fields and try again.</div>}
      <CategoryForm action={createCategoryAction} databaseReady={databaseReady} />
    </>
  );
}
