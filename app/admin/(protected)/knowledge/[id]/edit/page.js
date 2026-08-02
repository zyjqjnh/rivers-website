import { notFound } from "next/navigation";
import { updateKnowledgeArticleAction } from "@/app/admin/actions";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { getKnowledgeArticleById } from "@/lib/knowledge";
import { getProducts } from "@/lib/products";
import { isDatabaseConfigured } from "@/lib/prisma";
import { isR2Configured } from "@/lib/r2";

export const dynamic = "force-dynamic";

export default async function EditKnowledgeArticlePage({ params, searchParams }) {
  const { id } = await params;
  const [article, products] = await Promise.all([getKnowledgeArticleById(id), getProducts({ includeDrafts: true })]);
  if (!article) notFound();
  const query = await searchParams;
  return (
    <>
      <div className="mb-8"><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Knowledge Center</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{article.title}</h1><p className="mt-2 text-sm text-muted-foreground">Update the article, technical ownership, product links and search metadata.</p></div>
      {!isDatabaseConfigured && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">This article is read-only until PostgreSQL is configured.</div>}
      {query?.saved && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Article changes saved.</div>}
      {query?.created && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Article created successfully.</div>}
      {query?.error === "validation" && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">Complete the required fields and check the URL slug.</div>}
      {query?.error === "slug" && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">That URL slug is already used by another article.</div>}
      <ArticleForm action={updateKnowledgeArticleAction.bind(null, id)} article={article} databaseReady={isDatabaseConfigured} products={products} storageReady={isR2Configured} />
    </>
  );
}
