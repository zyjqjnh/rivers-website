import { HomeClient } from "@/components/HomeClient";
import { getCategories, getProducts } from "@/lib/products";
import { getBrand, getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories, siteSettings] = await Promise.all([
    getProducts({ featured: true }),
    getCategories(),
    getSiteSettings(),
  ]);
  return <HomeClient products={products.slice(0, 4)} categories={categories} brand={getBrand(siteSettings)} />;
}
