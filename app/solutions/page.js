import { SolutionsClient } from "@/components/SolutionsClient";
import { getCategories } from "@/lib/products";
import { getBrand, getSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "RF Remote Control Solutions",
  description: "Explore RF control solutions for industrial equipment, gates, motors, pumps, lighting, security systems and OEM integration.",
  alternates: { canonical: "/solutions" },
  openGraph: {
    title: "RF Remote Control Solutions",
    description: "Application-led RF remote control, receiver and module solutions engineered around your equipment.",
    url: "/solutions",
  },
};

export default async function SolutionsPage() {
  const [categories, siteSettings] = await Promise.all([getCategories(), getSiteSettings()]);

  return <SolutionsClient categories={categories} brand={getBrand(siteSettings)} />;
}
