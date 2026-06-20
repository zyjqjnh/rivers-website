import { HomeClient } from "@/components/HomeClient";
import { getCategories, getProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts({ featured: true }),
    getCategories(),
  ]);
  return <HomeClient products={products.slice(0, 4)} categories={categories} />;
}
