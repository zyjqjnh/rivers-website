import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Clock3 } from "lucide-react";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { PublicFooter } from "@/components/PublicFooter";
import { getKnowledgeArticleBySlug, getKnowledgeCategory } from "@/lib/knowledge";
import { getCategories } from "@/lib/products";
import { renderRichText } from "@/lib/rich-text";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await getKnowledgeArticleBySlug(slug);
  if (!article) return { title: "Knowledge article not found" };
  const title = article.seoTitle || article.title;
  const description = article.seoDescription || article.excerpt;
  return {
    title,
    description,
    alternates: { canonical: `/knowledge/${article.slug}` },
    openGraph: {
      type: "article",
      title,
      description,
      url: `/knowledge/${article.slug}`,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt?.toISOString(),
      images: article.coverImageUrl ? [{ url: article.coverImageUrl, alt: article.coverImageAlt || article.title }] : undefined,
    },
    twitter: {
      card: article.coverImageUrl ? "summary_large_image" : "summary",
      title,
      description,
      images: article.coverImageUrl ? [article.coverImageUrl] : undefined,
    },
  };
}

export default async function KnowledgeArticlePage({ params }) {
  const { slug } = await params;
  const [article, productCategories] = await Promise.all([
    getKnowledgeArticleBySlug(slug),
    getCategories(),
  ]);
  if (!article) notFound();
  const category = getKnowledgeCategory(article.category);
  const publishedAt = article.publishedAt || article.createdAt;
  const articleUrl = absoluteUrl(`/knowledge/${article.slug}`);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "TechArticle",
      headline: article.title,
      description: article.seoDescription || article.excerpt,
      image: article.coverImageUrl ? [absoluteUrl(article.coverImageUrl)] : undefined,
      datePublished: publishedAt.toISOString(),
      dateModified: article.updatedAt.toISOString(),
      articleSection: category?.name,
      author: { "@type": "Organization", name: article.authorName },
      publisher: { "@type": "Organization", name: SITE_NAME, url: absoluteUrl("/") },
      mainEntityOfPage: articleUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Knowledge", item: absoluteUrl("/knowledge") },
        ...(category ? [{ "@type": "ListItem", position: 3, name: category.name, item: absoluteUrl(`/knowledge/category/${category.slug}`) }] : []),
        { "@type": "ListItem", position: category ? 4 : 3, name: article.title, item: articleUrl },
      ],
    },
  ];

  return (
    <div className="knowledge-shell">
      <JsonLd data={structuredData} />
      <SiteHeader categories={productCategories} />
      <main className="knowledge-article-main">
        <div className="breadcrumb">
          <Link href="/knowledge">Knowledge</Link>
          {category && <> / <Link href={`/knowledge/category/${category.slug}`}>{category.name}</Link></>}
        </div>
        <header className="knowledge-article-header">
          <p className="eyebrow">{category?.name || "TECHNICAL GUIDE"}</p>
          <h1>{article.title}</h1>
          <p className="knowledge-article-excerpt">{article.excerpt}</p>
          <div className="knowledge-article-byline">
            <span>{article.authorName}</span>
            {article.reviewerName && <span>Reviewed by {article.reviewerName}</span>}
            <time dateTime={publishedAt.toISOString()}>{new Intl.DateTimeFormat("en", { year: "numeric", month: "long", day: "numeric" }).format(publishedAt)}</time>
            <span><Clock3 aria-hidden="true" />{article.readingMinutes} min read</span>
          </div>
        </header>

        {article.coverImageUrl && <figure className="knowledge-cover"><img src={article.coverImageUrl} alt={article.coverImageAlt || article.title} /></figure>}

        <div className="knowledge-article-layout">
          <article className="knowledge-rich-text" dangerouslySetInnerHTML={{ __html: renderRichText(article.content) }} />
          <aside className="knowledge-article-aside">
            <div className="knowledge-aside-card">
              <p className="eyebrow">NEED A MATCHED SYSTEM?</p>
              <h2>Turn the engineering guidance into a practical RF solution.</h2>
              <Link href="/products">Explore products <ArrowUpRight aria-hidden="true" /></Link>
            </div>
            {article.relatedProducts.length > 0 && (
              <div className="knowledge-related-products">
                <p className="eyebrow">RELATED PRODUCTS</p>
                {article.relatedProducts.map(({ product }) => (
                  <Link href={`/products/${product.slug}`} key={product.id}>
                    {product.images?.[0]?.url && <img src={product.images[0].url} alt="" />}
                    <span><small>{product.category?.name}</small><strong>{product.name}</strong></span>
                    <ArrowUpRight aria-hidden="true" />
                  </Link>
                ))}
              </div>
            )}
          </aside>
        </div>

        <div className="knowledge-article-back"><Link href="/knowledge"><ArrowLeft aria-hidden="true" />Back to Knowledge Center</Link></div>
      </main>
      <PublicFooter />
    </div>
  );
}
