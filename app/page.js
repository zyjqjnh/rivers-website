import { HomeClient } from "@/components/HomeClient";
import { getCategories, getProducts } from "@/lib/products";
import { getBrand, getSiteSettings } from "@/lib/site-settings";

const homeTitle = "Custom RF Control Solutions | ANRIVERS";
const homeDescription =
  "Custom RF control solutions for OEM and industrial applications: remote transmitters, relay receivers and modules tailored by voltage, range and channels.";

export const metadata = {
  title: { absolute: homeTitle },
  description: homeDescription,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    title: homeTitle,
    description: homeDescription,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: homeDescription,
  },
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [products, categories, siteSettings] = await Promise.all([
    getProducts({ featured: true }),
    getCategories(),
    getSiteSettings(),
  ]);
  return <HomeClient products={products.slice(0, 4)} categories={categories} brand={getBrand(siteSettings)} />;
}
