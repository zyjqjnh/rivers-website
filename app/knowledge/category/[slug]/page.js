import { notFound, redirect } from "next/navigation";
import { KnowledgeIndex } from "@/components/KnowledgeIndex";
import { SiteHeader } from "@/components/SiteHeader";
import { getKnowledgeArticles, getKnowledgeCategoryBySlug } from "@/lib/knowledge";
import { getCategories } from "@/lib/products";

export const dynamic = "force-dynamic";
const ARTICLES_PER_PAGE = 9;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = getKnowledgeCategoryBySlug(slug);
  if (!category) return { title: "Knowledge category not found" };
  return {
    title: `${category.name} | RF Control Knowledge Center`,
    description: category.description,
    alternates: { canonical: `/knowledge/category/${category.slug}` },
    openGraph: {
      title: category.name,
      description: category.description,
      url: `/knowledge/category/${category.slug}`,
    },
  };
}

export default async function KnowledgeCategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const category = getKnowledgeCategoryBySlug(slug);
  if (!category) notFound();
  const requestedPage = typeof query?.page === "string" && /^\d+$/.test(query.page) ? Number(query.page) : 1;
  const [allArticles, productCategories] = await Promise.all([
    getKnowledgeArticles({ category: category.value }),
    getCategories(),
  ]);
  const totalPages = Math.max(1, Math.ceil(allArticles.length / ARTICLES_PER_PAGE));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
  const pathname = `/knowledge/category/${category.slug}`;
  if (requestedPage !== currentPage || query?.page === "1") {
    redirect(currentPage === 1 ? pathname : `${pathname}?page=${currentPage}`);
  }
  const articles = allArticles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE);

  return (
    <div className="knowledge-shell">
      <SiteHeader categories={productCategories} />
      <main className="knowledge-main">
        <div className="breadcrumb"><a href="/knowledge">Knowledge</a> / {category.name}</div>
        <header className="knowledge-hero knowledge-hero-category">
          <div><p className="eyebrow">KNOWLEDGE CATEGORY</p><h1>{category.name}</h1></div>
          <p>{category.description}</p>
        </header>
        <KnowledgeIndex articles={articles} currentCategory={category} currentPage={currentPage} pathname={pathname} totalPages={totalPages} />
      </main>
    </div>
  );
}
