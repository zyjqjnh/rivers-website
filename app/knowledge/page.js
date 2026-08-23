import { redirect } from "next/navigation";
import { KnowledgeIndex } from "@/components/KnowledgeIndex";
import { SiteHeader } from "@/components/SiteHeader";
import { getKnowledgeArticles } from "@/lib/knowledge";
import { getCategories } from "@/lib/products";
import { paginatedCanonical } from "@/lib/seo";

const title = "RF Control Knowledge Center";
const description = "Technical guides for RF remote controls, wireless relays, motor control, frequency selection and industrial wireless applications.";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const canonical = paginatedCanonical("/knowledge", params);
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description: "Practical RF control guidance for engineers, OEM teams and technical buyers.",
      url: canonical,
    },
  };
}

export const dynamic = "force-dynamic";
const ARTICLES_PER_PAGE = 6;

export default async function KnowledgePage({ searchParams }) {
  const params = await searchParams;
  const requestedPage = typeof params?.page === "string" && /^\d+$/.test(params.page) ? Number(params.page) : 1;
  const [allArticles, productCategories] = await Promise.all([getKnowledgeArticles(), getCategories()]);
  const totalPages = Math.max(1, Math.ceil(allArticles.length / ARTICLES_PER_PAGE));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
  if (requestedPage !== currentPage || params?.page === "1") {
    redirect(currentPage === 1 ? "/knowledge" : `/knowledge?page=${currentPage}`);
  }
  const articles = allArticles.slice((currentPage - 1) * ARTICLES_PER_PAGE, currentPage * ARTICLES_PER_PAGE);

  return (
    <div className="knowledge-shell">
      <SiteHeader categories={productCategories} />
      <main className="knowledge-main">
        <header className="knowledge-hero">
          <div>
            <p className="eyebrow">TECHNICAL KNOWLEDGE</p>
            <h1>Make better wireless control decisions.</h1>
          </div>
          <p>Practical guidance on RF selection, system design, installation and troubleshooting—written for engineers, product teams and technical buyers.</p>
        </header>
        <KnowledgeIndex articles={articles} currentPage={currentPage} pathname="/knowledge" totalPages={totalPages} />
      </main>
    </div>
  );
}
