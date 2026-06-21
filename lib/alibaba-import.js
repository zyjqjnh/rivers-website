import "server-only";
import dns from "node:dns/promises";
import net from "node:net";
import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getR2Client, getR2PublicUrl, isR2Configured } from "@/lib/r2";

const MAX_HTML_BYTES = 5 * 1024 * 1024;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_IMAGES = 8;
const ALLOWED_IMAGE_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/avif", "avif"],
]);

export async function importAlibabaProduct(rawUrl) {
  const sourceUrl = await validatePublicAlibabaUrl(rawUrl);
  const html = await fetchText(sourceUrl);
  if (isAlibabaChallengePage(html)) {
    return buildBlockedPageDraft(sourceUrl);
  }
  const extracted = extractAlibabaProduct(html, sourceUrl);
  const warnings = [...extracted.warnings];
  let images = extracted.images;

  if (images.length && isR2Configured) {
    const copied = await copyImagesToR2(images);
    images = copied.urls.length ? copied.urls : images;
    warnings.push(...copied.warnings);
  } else if (images.length) {
    warnings.push("R2 is not configured, so imported image URLs still point to Alibaba. Upload permanent copies before publishing.");
  }

  return {
    ...extracted,
    images,
    sourceUrl: sourceUrl.toString(),
    warnings,
  };
}

function isAlibabaChallengePage(html) {
  return /g\.alicdn\.com\/sd\/punish|sufei-punish|AWSC\/CAPTCHA|punish-page/i.test(html) &&
    !/<meta\b[^>]*(?:property|name)=["']og:title["']/i.test(html);
}

function buildBlockedPageDraft(sourceUrl) {
  const { name, productId } = productIdentityFromUrl(sourceUrl);
  const warnings = [
    "Alibaba returned a verification page instead of the product details. The title was recovered from the URL, but descriptions, specifications, and images could not be fetched.",
    "Open the source page in your browser and complete the missing fields before creating this draft.",
  ];
  return {
    name,
    slug: slugify(name).slice(0, 90) || `alibaba-product-${productId || Date.now()}`,
    modelNumber: productId ? `Alibaba ${productId}` : "",
    shortDescription: `${name}. Review and complete the product information before publishing.`,
    description: `<p>Alibaba blocked automated access to the product details. Review the <a href="${escapeHtml(sourceUrl.toString())}">original product page</a> and complete this description before publishing.</p>`,
    specifications: productId ? [{ label: "Alibaba product ID", value: productId }] : [],
    images: [],
    seoTitle: trimTo(`${name} | Rivers RF Control`, 60),
    seoDescription: trimTo(`${name}. Contact Rivers RF Control for product specifications and customization options.`, 155),
    sourceUrl: sourceUrl.toString(),
    warnings,
  };
}

function productIdentityFromUrl(sourceUrl) {
  const filename = decodeURIComponent(sourceUrl.pathname.split("/").filter(Boolean).pop() || "")
    .replace(/\.html$/i, "");
  const productId = filename.match(/_(\d{8,})$/)?.[1] || filename.match(/^(\d{8,})$/)?.[1] || "";
  const titlePart = filename.replace(/_\d{8,}$/, "").replace(/^product-detail[-_/]*/i, "");
  const name = cleanProductTitle(titlePart.replace(/[-_]+/g, " ")) || `Alibaba product ${productId}`.trim();
  return { name, productId };
}

export function extractAlibabaProduct(html, sourceUrl) {
  const jsonLd = extractJsonLd(html);
  const productJson = jsonLd.find((item) => {
    const type = item?.["@type"];
    return type === "Product" || (Array.isArray(type) && type.includes("Product"));
  }) || {};

  const meta = extractMeta(html);
  const embeddedTitle = findJsonString(html, ["subject", "productTitle", "productName"]);
  const rawTitle =
    cleanText(productJson.name) ||
    cleanText(meta["og:title"]) ||
    cleanText(embeddedTitle) ||
    cleanText(extractTagContent(html, "title"));
  const name = cleanProductTitle(rawTitle);
  if (!name) throw new Error("No product title was found. The Alibaba page may require sign-in or may have changed format.");

  const rawDescription =
    cleanText(productJson.description) ||
    cleanText(meta["og:description"]) ||
    cleanText(meta.description) ||
    cleanText(findJsonString(html, ["description", "productDescription"])) ||
    "";
  const shortDescription = makeShortDescription(rawDescription, name);
  const specifications = uniqueSpecifications([
    ...extractJsonLdProperties(productJson),
    ...extractTableSpecifications(html),
    ...extractEmbeddedSpecifications(html),
  ]).slice(0, 40);
  const modelNumber =
    firstSpecificationValue(specifications, ["model number", "model no", "model"]) ||
    cleanText(productJson.sku) ||
    "";
  const images = uniqueUrls([
    ...normalizeImageValues(productJson.image),
    meta["og:image"],
    meta["twitter:image"],
    ...extractImageUrls(html),
  ], sourceUrl).slice(0, MAX_IMAGES);
  const description = buildDescriptionHtml(rawDescription, specifications, sourceUrl);
  const slug = slugify(name).slice(0, 90) || `imported-product-${Date.now()}`;
  const warnings = [];

  if (!rawDescription) warnings.push("No description was found. Add a buyer-focused description before publishing.");
  if (!specifications.length) warnings.push("No structured specifications were found. Check the Alibaba page and add them manually.");
  if (!images.length) warnings.push("No product images were found. Upload images before publishing.");

  return {
    name,
    slug,
    modelNumber,
    shortDescription,
    description,
    specifications,
    images,
    seoTitle: trimTo(`${name} | Rivers RF Control`, 60),
    seoDescription: trimTo(shortDescription, 155),
    warnings,
  };
}

async function validatePublicAlibabaUrl(rawUrl) {
  let url;
  try {
    url = new URL(String(rawUrl || "").trim());
  } catch {
    throw new Error("Enter a complete Alibaba product URL.");
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") throw new Error("Only HTTP or HTTPS URLs are supported.");
  const hostname = url.hostname.toLowerCase().replace(/\.$/, "");
  if (!(hostname === "alibaba.com" || hostname.endsWith(".alibaba.com"))) {
    throw new Error("Only public Alibaba.com product URLs are supported.");
  }
  await assertPublicHostname(hostname);
  url.hash = "";
  return url;
}

async function assertPublicHostname(hostname) {
  const addresses = await dns.lookup(hostname, { all: true });
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error("The product URL did not resolve to a public Alibaba server.");
  }
}

function isPrivateAddress(address) {
  if (net.isIPv4(address)) {
    const [a, b] = address.split(".").map(Number);
    return a === 10 || a === 127 || a === 0 || (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ||
      (a === 100 && b >= 64 && b <= 127) || a >= 224;
  }
  const normalized = address.toLowerCase();
  return normalized === "::1" || normalized === "::" || normalized.startsWith("fc") ||
    normalized.startsWith("fd") || normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb");
}

async function fetchText(url) {
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; RiversProductImporter/1.0; +https://anrivers.com)",
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml",
    },
  });
  if (!response.ok) throw new Error(`Alibaba returned HTTP ${response.status}. Try a public product detail URL.`);
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) throw new Error("The URL did not return an HTML product page.");
  const declaredLength = Number(response.headers.get("content-length"));
  if (declaredLength > MAX_HTML_BYTES) throw new Error("The Alibaba page is too large to import safely.");
  const text = await response.text();
  if (Buffer.byteLength(text) > MAX_HTML_BYTES) throw new Error("The Alibaba page is too large to import safely.");
  return text;
}

function extractJsonLd(html) {
  const items = [];
  const pattern = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const match of html.matchAll(pattern)) {
    try {
      const parsed = JSON.parse(decodeHtml(match[1]).trim());
      const values = Array.isArray(parsed) ? parsed : parsed?.["@graph"] || [parsed];
      items.push(...values);
    } catch {
      // Ignore malformed vendor JSON.
    }
  }
  return items;
}

function extractMeta(html) {
  const result = {};
  const pattern = /<meta\b[^>]*>/gi;
  for (const match of html.matchAll(pattern)) {
    const tag = match[0];
    const key = getAttribute(tag, "property") || getAttribute(tag, "name");
    const value = getAttribute(tag, "content");
    if (key && value) result[key.toLowerCase()] = decodeHtml(value);
  }
  return result;
}

function getAttribute(tag, name) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, "i"));
  return match?.[2] || "";
}

function extractTagContent(html, tagName) {
  return html.match(new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i"))?.[1] || "";
}

function findJsonString(html, keys) {
  for (const key of keys) {
    const pattern = new RegExp(`"${key}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, "i");
    const value = html.match(pattern)?.[1];
    if (value) {
      try {
        return JSON.parse(`"${value}"`);
      } catch {
        return value;
      }
    }
  }
  return "";
}

function extractJsonLdProperties(product) {
  const properties = Array.isArray(product.additionalProperty) ? product.additionalProperty : [];
  return properties.map((item) => ({
    label: cleanText(item?.name),
    value: cleanText(item?.value),
  })).filter(validSpecification);
}

function extractTableSpecifications(html) {
  const specs = [];
  const rowPattern = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;
  for (const row of html.matchAll(rowPattern)) {
    const cells = [...row[1].matchAll(/<(?:th|td)\b[^>]*>([\s\S]*?)<\/(?:th|td)>/gi)]
      .map((cell) => cleanText(cell[1]));
    if (cells.length >= 2 && cells[0] && cells[1]) specs.push({ label: cells[0], value: cells.slice(1).join(" · ") });
  }
  const listPattern = /<[^>]+class=["'][^"']*(?:attribute|specification)[^"']*["'][^>]*>([\s\S]*?)<\/[^>]+>/gi;
  for (const block of html.matchAll(listPattern)) {
    const text = cleanText(block[1]);
    const separator = text.indexOf(":");
    if (separator > 0) specs.push({ label: text.slice(0, separator), value: text.slice(separator + 1) });
  }
  return specs;
}

function extractEmbeddedSpecifications(html) {
  const specs = [];
  const pattern = /"(?:attrName|attributeName|propertyName|name)"\s*:\s*"((?:\\.|[^"\\])*)"\s*,\s*"(?:attrValue|attributeValue|propertyValue|value)"\s*:\s*"((?:\\.|[^"\\])*)"/gi;
  for (const match of html.matchAll(pattern)) {
    specs.push({ label: cleanJsonText(match[1]), value: cleanJsonText(match[2]) });
  }
  return specs;
}

function extractImageUrls(html) {
  const urls = [];
  const patterns = [
    /https?:\\?\/\\?\/[^"'\\\s<>]+?\.(?:jpe?g|png|webp|gif|avif)(?:\?[^"'\\\s<>]*)?/gi,
    /"(?:imageUrl|imageURL|originalImage|mainImage|src)"\s*:\s*"([^"]+)"/gi,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) urls.push(match[1] || match[0]);
  }
  return urls;
}

function normalizeImageValues(value) {
  if (Array.isArray(value)) return value.flatMap(normalizeImageValues);
  if (typeof value === "string") return [value];
  if (value?.url) return [value.url];
  return [];
}

function uniqueUrls(values, baseUrl) {
  const seen = new Set();
  const urls = [];
  for (const raw of values) {
    if (!raw) continue;
    const cleaned = decodeHtml(String(raw)).replaceAll("\\/", "/").replaceAll("\\u002F", "/").trim();
    try {
      const url = new URL(cleaned.startsWith("//") ? `https:${cleaned}` : cleaned, baseUrl);
      if (!["http:", "https:"].includes(url.protocol)) continue;
      url.hash = "";
      const normalized = url.toString();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        urls.push(normalized);
      }
    } catch {
      // Ignore malformed image URLs.
    }
  }
  return urls;
}

function uniqueSpecifications(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const label = cleanText(item?.label).replace(/:$/, "");
    const value = cleanText(item?.value);
    if (!validSpecification({ label, value })) continue;
    const key = label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({ label: trimTo(label, 100), value: trimTo(value, 500) });
  }
  return result;
}

function validSpecification(item) {
  return Boolean(item.label && item.value && item.label.length <= 120 && item.value.length <= 600);
}

function firstSpecificationValue(specs, labels) {
  const match = specs.find((spec) => labels.includes(spec.label.toLowerCase()));
  return match?.value || "";
}

function cleanProductTitle(value) {
  return cleanText(value)
    .replace(/\s*[-|]\s*(?:Alibaba\.com|Alibaba).*$/i, "")
    .replace(/^(?:Wholesale|Hot Sale|Factory Price)\s+/i, "")
    .trim();
}

function makeShortDescription(description, name) {
  const cleaned = cleanText(description)
    .replace(/\b(?:contact supplier|chat now|send inquiry|free shipping)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  return trimTo(cleaned || `${name} available for RF control applications and customization.`, 280);
}

function buildDescriptionHtml(description, specifications, sourceUrl) {
  const paragraphs = cleanText(description)
    .split(/(?<=[.!?])\s+(?=[A-Z])/)
    .filter(Boolean)
    .slice(0, 6);
  const body = paragraphs.length
    ? paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")
    : "<p>Review and complete this imported product description before publishing.</p>";
  const specList = specifications.length
    ? `<h2>Key specifications</h2><ul>${specifications.slice(0, 12).map((item) => `<li><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.value)}</li>`).join("")}</ul>`
    : "";
  return `${body}${specList}<p><em>Imported from <a href="${escapeHtml(sourceUrl.toString())}">the original Alibaba product page</a>. Review all content before publishing.</em></p>`;
}

function cleanJsonText(value) {
  try {
    return cleanText(JSON.parse(`"${value}"`));
  } catch {
    return cleanText(value);
  }
}

function cleanText(value) {
  return decodeHtml(String(value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ")).trim();
}

function decodeHtml(value) {
  const named = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  return String(value || "")
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&([a-z]+);/gi, (match, name) => named[name.toLowerCase()] ?? match);
}

function slugify(value) {
  return String(value || "").normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function trimTo(value, max) {
  const text = cleanText(value);
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trim()}…`;
}

function escapeHtml(value) {
  return String(value || "").replaceAll("&", "&amp;").replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

async function copyImagesToR2(urls) {
  const copied = [];
  const warnings = [];
  for (const [index, url] of urls.entries()) {
    try {
      copied.push(await copyImageToR2(url, index));
    } catch (error) {
      warnings.push(`Image ${index + 1} could not be copied to R2: ${error.message}`);
    }
  }
  return { urls: copied, warnings };
}

async function copyImageToR2(rawUrl, index) {
  const url = new URL(rawUrl);
  await assertPublicHostname(url.hostname);
  const response = await fetch(url, {
    redirect: "follow",
    signal: AbortSignal.timeout(15000),
    headers: { "User-Agent": "Mozilla/5.0 (compatible; RiversProductImporter/1.0)" },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const contentType = (response.headers.get("content-type") || "").split(";")[0].toLowerCase();
  const extension = ALLOWED_IMAGE_TYPES.get(contentType);
  if (!extension) throw new Error("unsupported image type");
  const declaredLength = Number(response.headers.get("content-length"));
  if (declaredLength > MAX_IMAGE_BYTES) throw new Error("image is larger than 10 MB");
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > MAX_IMAGE_BYTES) throw new Error("image is larger than 10 MB");
  const now = new Date();
  const datePath = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
  const key = `product-images/imported/${datePath}/${randomUUID()}-${index + 1}.${extension}`;
  await getR2Client().send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    Body: bytes,
    ContentType: contentType,
    ContentLength: bytes.length,
  }));
  return getR2PublicUrl(key);
}
