import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CataloguePagination } from "@/components/CataloguePagination";
import { JsonLd } from "@/components/JsonLd";
import { SiteHeader } from "@/components/SiteHeader";
import { getCategories, getCategoryBySlug, getProducts } from "@/lib/products";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

const PRODUCTS_PER_PAGE = 6;

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Product category not found" };

  const title = category.seoTitle || `${category.name} RF Products`;
  const description =
    category.seoDescription ||
    category.description ||
    `Browse ${category.name.toLowerCase()} from Rivers RF Control.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/products/category/${category.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `/products/category/${category.slug}`,
    },
  };
}

export default async function ProductCategoryPage({ params, searchParams }) {
  const { slug } = await params;
  const query = await searchParams;
  const [category, allProducts, categories] = await Promise.all([
    getCategoryBySlug(slug),
    getProducts(),
    getCategories(),
  ]);
  if (!category) notFound();

  const categoryProducts = allProducts.filter((product) => product.category?.slug === category.slug);
  const requestedPage = typeof query?.page === "string" && /^\d+$/.test(query.page) ? Number(query.page) : 1;
  const totalPages = Math.max(1, Math.ceil(categoryProducts.length / PRODUCTS_PER_PAGE));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);
  const pathname = `/products/category/${category.slug}`;
  if (requestedPage !== currentPage || query?.page === "1") {
    redirect(currentPage === 1 ? pathname : `${pathname}?page=${currentPage}`);
  }
  const products = categoryProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE,
  );
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Products", item: absoluteUrl("/products") },
        {
          "@type": "ListItem",
          position: 3,
          name: category.name,
          item: absoluteUrl(`/products/category/${category.slug}`),
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: category.name,
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: (currentPage - 1) * PRODUCTS_PER_PAGE + index + 1,
        name: product.name,
        url: absoluteUrl(`/products/${product.slug}`),
      })),
    },
  ];

  return (
    <div className="catalogue-shell">
      <JsonLd data={structuredData} />
      <SiteHeader categories={categories} />
      <main className="catalogue-main">
        <div className="breadcrumb">
          <Link href="/products">Products</Link> / {category.name}
        </div>
        <div className="page-intro">
          <p className="eyebrow">PRODUCT CATEGORY</p>
          <h1>{category.name}</h1>
          <p>{category.description || `Browse our ${category.name.toLowerCase()} product range.`}</p>
          <Link className="catalogue-clear-filter" href="/products">View all products</Link>
        </div>
        {products.length > 0 ? (
          <div className="catalogue-grid">
            {products.map((product) => (
              <Link className="catalogue-card" href={`/products/${product.slug}`} key={product.id}>
                <div className="catalogue-card-image">
                  <img
                    src={product.images?.[0]?.url || "/assets/67d6ba3c0e8ef810.jpg"}
                    alt={product.images?.[0]?.alt || product.name}
                  />
                </div>
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
        <CataloguePagination
          currentPage={currentPage}
          pathname={pathname}
          totalPages={totalPages}
        />
      </main>
    </div>
  );
}
