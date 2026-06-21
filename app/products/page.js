import Link from "next/link";
import { redirect } from "next/navigation";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { getCategories, getProducts } from "@/lib/products";
import { absoluteUrl } from "@/lib/seo";

export const metadata = {
  title: "RF Products",
  description: "Browse RF remote controllers, receivers, modules and sensors from Rivers RF Control.",
  alternates: {
    canonical: "/products",
  },
  openGraph: {
    title: "RF Products",
    description: "Browse RF remote controllers, receivers, modules and sensors from Rivers RF Control.",
    url: "/products",
  },
};

export const dynamic = "force-dynamic";

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const categorySlug = typeof params?.category === "string" ? params.category : "";
  if (categorySlug) redirect(`/products/category/${encodeURIComponent(categorySlug)}`);
  const [allProducts, categories] = await Promise.all([getProducts(), getCategories()]);
  const products = allProducts;
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Rivers RF Control product catalogue",
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: product.name,
      url: absoluteUrl(`/products/${product.slug}`),
    })),
  };

  return (
    <div className="catalogue-shell">
      <JsonLd data={itemList} />
      <SiteHeader categories={categories} />
      <main className="catalogue-main">
        <div className="page-intro">
          <p className="eyebrow">PRODUCT CATALOGUE</p>
          <h1>RF hardware ready to fit your application.</h1>
          <p>Browse the starting range below. Every product can be configured around frequency, channels, voltage, range, enclosure and private-label requirements.</p>
        </div>
        {products.length > 0 ? (
          <div className="catalogue-grid">
            {products.map((product) => (
              <Link className="catalogue-card" href={`/products/${product.slug}`} key={product.id}>
                <div className="catalogue-card-image"><img src={product.images?.[0]?.url || "/assets/67d6ba3c0e8ef810.jpg"} alt={product.images?.[0]?.alt || product.name} /></div>
                <span className="meta">{product.category?.name} · {product.modelNumber || "Custom model"}</span>
                <h2>{product.name}</h2>
                <p>{product.shortDescription}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="catalogue-empty">
            <h2>No products in this category yet.</h2>
            <p>Our team can still configure a solution around your application requirements.</p>
            <Link href="/products">View all products</Link>
          </div>
        )}
      </main>
    </div>
  );
}
