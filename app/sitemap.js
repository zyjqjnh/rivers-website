import { getCategories, getProducts } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const [products, categories] = await Promise.all([getProducts(), getCategories()]);
  const latestContentUpdate = [...products, ...categories]
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
  ];
}
