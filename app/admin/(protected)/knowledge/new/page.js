import { createKnowledgeArticleAction } from "@/app/admin/actions";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { getProducts } from "@/lib/products";
import { isDatabaseConfigured } from "@/lib/prisma";
import { isR2Configured } from "@/lib/r2";

export default async function NewKnowledgeArticlePage({ searchParams }) {
  const products = await getProducts({ includeDrafts: true });
  const query = await searchParams;
  return (
    <>
      <div className="mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Knowledge Center</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Add article</h1><p className="mt-2 text-sm text-muted-foreground">Create an answer-first technical guide, connect relevant products, then publish when reviewed.</p></div>
      {!isDatabaseConfigured && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">The form is read-only until PostgreSQL is configured.</div>}
      {query?.error === "validation" && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">Complete the required fields and use a lowercase URL slug.</div>}
      {query?.error === "slug" && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">That URL slug is already used by another article.</div>}
      <ArticleForm action={createKnowledgeArticleAction} databaseReady={isDatabaseConfigured} products={products} storageReady={isR2Configured} />
    </>
  );
}
