import { AlibabaImportTool } from "@/components/admin/AlibabaImportTool";
import { getCategories } from "@/lib/products";
import { isDatabaseConfigured } from "@/lib/prisma";
import { isR2Configured } from "@/lib/r2";

export const dynamic = "force-dynamic";

export default async function ImportAlibabaProductPage() {
  const categories = await getCategories();
  return (
    <>
      <div className="mb-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Product importer</p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Import from Alibaba</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">Fetch public product information, clean it with predictable rules, then review every field before creating a catalogue draft.</p>
      </div>
      {!isDatabaseConfigured && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">PostgreSQL is unavailable, so imported products cannot be saved.</div>}
      <AlibabaImportTool categories={categories} databaseReady={isDatabaseConfigured} storageReady={isR2Configured} />
    </>
  );
}
