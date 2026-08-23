export const SITE_NAME = "ANRIVERS RF Control";
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://anrivers.com";
export const SITE_DESCRIPTION =
  "ANRIVERS delivers custom RF control solutions, including transmitters, receivers and modules tailored for OEM and industrial applications.";

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}

export function paginatedCanonical(pathname, searchParams) {
  const page = typeof searchParams?.page === "string" ? searchParams.page : "";
  if (!/^\d+$/.test(page) || Number(page) <= 1) return pathname;
  return `${pathname}?page=${Number(page)}`;
}

export function jsonLd(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
