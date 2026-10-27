import { SiteFooter } from "@/components/SiteFooter";
import { getBrand, getSiteSettings } from "@/lib/site-settings";

export async function PublicFooter() {
  return <SiteFooter brand={getBrand(await getSiteSettings())} />;
}
