import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import { CataloguePagination } from "@/components/CataloguePagination";
import { KNOWLEDGE_CATEGORIES, getKnowledgeCategory } from "@/lib/knowledge";

export function KnowledgeIndex({
  articles,
  currentCategory,
  currentPage,
  pathname,
  totalPages,
}) {
  return (
    <>
      <nav className="knowledge-category-nav" aria-label="Knowledge categories">
        <Link href="/knowledge" aria-current={!currentCategory ? "page" : undefined}>All topics</Link>
        {KNOWLEDGE_CATEGORIES.map((category) => (
          <Link
            href={`/knowledge/category/${category.slug}`}
            aria-current={currentCategory?.value === category.value ? "page" : undefined}
            key={category.value}
          >
            {category.name}
          </Link>
        ))}
      </nav>

      {articles.length > 0 ? (
        <div className="knowledge-grid">
          {articles.map((article) => <KnowledgeCard article={article} key={article.id} />)}
        </div>
      ) : (
        <div className="knowledge-empty">
          <p className="eyebrow">KNOWLEDGE CENTER</p>
          <h2>Engineering guidance is being prepared.</h2>
          <p>Our first technical guides will cover RF selection, wiring and application design. In the meantime, browse the product catalogue or send us your control requirements.</p>
          <Link href="/products">Explore products</Link>
        </div>
      )}

      <CataloguePagination
        ariaLabel="Knowledge article pagination"
        currentPage={currentPage}
        pathname={pathname}
        totalPages={totalPages}
      />
    </>
  );
}

function KnowledgeCard({ article }) {
  const category = getKnowledgeCategory(article.category);
  const publishedAt = article.publishedAt || article.createdAt;
  return (
    <article className="knowledge-card">
      <Link className="knowledge-card-visual" href={`/knowledge/${article.slug}`}>
        {article.coverImageUrl ? (
          <img src={article.coverImageUrl} alt={article.coverImageAlt || article.title} />
        ) : (
          <span>{category?.name || "Technical guide"}</span>
        )}
      </Link>
      <div className="knowledge-card-body">
        <div className="knowledge-card-meta">
          <span>{category?.name}</span>
          <span><Clock3 aria-hidden="true" />{article.readingMinutes} min read</span>
        </div>
        <h2><Link href={`/knowledge/${article.slug}`}>{article.title}</Link></h2>
        <p>{article.excerpt}</p>
        <div className="knowledge-card-footer">
          <time dateTime={new Date(publishedAt).toISOString()}>
            {new Intl.DateTimeFormat("en", { year: "numeric", month: "short", day: "numeric" }).format(new Date(publishedAt))}
          </time>
          <Link href={`/knowledge/${article.slug}`} aria-label={`Read ${article.title}`}>Read guide <ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </div>
    </article>
  );
}
