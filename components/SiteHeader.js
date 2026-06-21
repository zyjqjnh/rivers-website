import Link from "next/link";
import { ProductsNavMenu } from "@/components/ProductsNavMenu";
import { getBrand, getSiteSettings } from "@/lib/site-settings";

export async function SiteHeader({ categories = [] }) {
  const brand = getBrand(await getSiteSettings());
  return (
    <header className="simple-header">
      <Link className="brand" href="/" aria-label={`${brand.title} ${brand.subtitle}`}>{brand.title}<span>{brand.subtitle}</span></Link>
      <nav className="simple-nav">
        <ProductsNavMenu categories={categories} />
        <Link href="/#capabilities">Capabilities</Link>
      </nav>
    </header>
  );
}
