import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { ProductsNavMenu } from "@/components/ProductsNavMenu";
import { getBrand, getSiteSettings } from "@/lib/site-settings";

export async function SiteHeader({ categories = [] }) {
  const brand = getBrand(await getSiteSettings());
  return (
    <header className="simple-header">
      <BrandLogo brand={brand} />
      <nav className="simple-nav">
        <ProductsNavMenu categories={categories} />
        <Link href="/#capabilities">Capabilities</Link>
      </nav>
    </header>
  );
}
