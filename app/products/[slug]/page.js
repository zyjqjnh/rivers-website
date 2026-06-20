import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { ProductImageGallery } from "@/components/ProductImageGallery";
import { getCategories, getProductBySlug } from "@/lib/products";
import { renderRichText } from "@/lib/rich-text";
import { getSiteSettings, getWhatsAppUrl } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }) {
  const { slug } = await params;
  const [product, siteSettings, categories] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
    getCategories(),
  ]);
  if (!product) notFound();
  const whatsappUrl = getWhatsAppUrl(siteSettings, product.name);

  return (
    <div className="product-detail-shell">
      <SiteHeader categories={categories} />
      <main className="product-detail-main">
        <div className="breadcrumb"><Link href="/products">Products</Link> / {product.category?.name} / {product.name}</div>
        <div className="product-detail-grid">
          <ProductImageGallery images={product.images || []} productName={product.name} />
          <div className="product-detail-copy">
            <p className="eyebrow">{product.category?.name}</p>
            <h1>{product.name}</h1>
            {product.modelNumber && <span className="model-number">MODEL · {product.modelNumber}</span>}
            <p className="product-lead">{product.shortDescription}</p>
            {product.description && <div className="product-rich-text" dangerouslySetInnerHTML={{ __html: renderRichText(product.description) }} />}
            <div className="spec-table">
              {product.specifications?.map((spec) => <div className="spec-row" key={spec.id}><span>{spec.label}</span><strong>{spec.value}</strong></div>)}
            </div>
            {whatsappUrl && <a className="whatsapp-button" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle />Chat on WhatsApp</a>}
          </div>
        </div>
      </main>
    </div>
  );
}
