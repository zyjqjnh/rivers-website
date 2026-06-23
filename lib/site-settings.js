import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const defaultSiteSettings = {
  id: "site",
  brandTitle: "RIVERS",
  brandSubtitle: "RF CONTROL",
  whatsappEnabled: true,
  whatsappNumber: "",
  whatsappMessageTemplate: "Hello, I am interested in {product}. Please send me more information.",
};

export async function getSiteSettings() {
  if (!isDatabaseConfigured) return defaultSiteSettings;
  try {
    return await prisma.siteSettings.findUnique({ where: { id: "site" } }) || defaultSiteSettings;
  } catch {
    return defaultSiteSettings;
  }
}

export function getBrand(settings) {
  return {
    title: String(settings?.brandTitle || defaultSiteSettings.brandTitle).trim() || defaultSiteSettings.brandTitle,
    subtitle: String(settings?.brandSubtitle || defaultSiteSettings.brandSubtitle).trim() || defaultSiteSettings.brandSubtitle,
  };
}

export function getWhatsAppUrl(settings, productName, productUrl) {
  if (!settings.whatsappEnabled) return null;
  const number = String(settings.whatsappNumber || "").replace(/\D/g, "");
  const template = settings.whatsappMessageTemplate || defaultSiteSettings.whatsappMessageTemplate;
  const hasUrlPlaceholder = template.includes("{url}");
  const message = template
    .replaceAll("{product}", productName)
    .replaceAll("{url}", productUrl);
  const messageWithUrl = hasUrlPlaceholder ? message : `${message}\n${productUrl}`;
  return `https://wa.me/${number}?text=${encodeURIComponent(messageWithUrl)}`;
}
