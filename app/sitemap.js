import { getCategories, getProducts } from "@/lib/products";
import { getKnowledgeArticles, KNOWLEDGE_CATEGORIES } from "@/lib/knowledge";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const [products, categories, articles] = await Promise.all([getProducts(), getCategories(), getKnowledgeArticles()]);
  const latestContentUpdate = [...products, ...categories, ...articles]
    .map((item) => item.updatedAt || item.publishedAt)
    .filter(Boolean)
    .map((value) => new Date(value))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  return [
    {
      url: SITE_URL,
      lastModified: latestContentUpdate,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: latestContentUpdate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/knowledge`,
      lastModified: latestContentUpdate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    ...KNOWLEDGE_CATEGORIES.map((category) => ({
      url: `${SITE_URL}/knowledge/category/${category.slug}`,
      lastModified: articles
        .filter((article) => article.category === category.value)
        .map((article) => article.updatedAt)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || latestContentUpdate,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
    ...categories.map((category) => ({
      url: `${SITE_URL}/products/category/${category.slug}`,
      lastModified: category.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    })),
    ...products.map((product) => ({
      url: `${SITE_URL}/products/${product.slug}`,
      lastModified: product.updatedAt || product.publishedAt,
      changeFrequency: "monthly",
      priority: 0.8,
      images: product.images?.map((image) =>
        image.url.startsWith("http") ? image.url : `${SITE_URL}${image.url}`,
      ),
    })),
    ...articles.map((article) => ({
      url: `${SITE_URL}/knowledge/${article.slug}`,
      lastModified: article.updatedAt,
      changeFrequency: "monthly",
      priority: article.featured ? 0.8 : 0.7,
      images: article.coverImageUrl
        ? [article.coverImageUrl.startsWith("http") ? article.coverImageUrl : `${SITE_URL}${article.coverImageUrl}`]
        : undefined,
    })),
  ];
}
