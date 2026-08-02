"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { clearAdminSession, createAdminSession, isAdminAuthenticated } from "@/lib/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { sanitizeRichText } from "@/lib/rich-text";

const productSchema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2).regex(/^[a-z0-9-]+$/),
  modelNumber: z.string().trim().optional(),
  categoryId: z.string().min(1),
  shortDescription: z.string().trim().min(10),
  description: z.string().trim().optional(),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean(),
  imageUrls: z.string().optional(),
  specifications: z.string().optional(),
  seoTitle: z.string().trim().optional(),
  seoDescription: z.string().trim().optional(),
});

const categorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().min(2).max(100).regex(/^[a-z0-9-]+$/),
  description: z.string().trim().max(500).optional(),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  sortOrder: z.coerce.number().int().min(0).max(100000),
});

const knowledgeArticleSchema = z.object({
  title: z.string().trim().min(5).max(180),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/),
  excerpt: z.string().trim().min(20).max(600),
  content: z.string().trim().min(20),
  category: z.enum(["RF_FUNDAMENTALS", "SELECTION_GUIDES", "ENGINEERING_TROUBLESHOOTING", "APPLICATION_GUIDES"]),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
  featured: z.boolean(),
  authorName: z.string().trim().min(2).max(120),
  reviewerName: z.string().trim().max(120).optional(),
  coverImageUrl: z.string().trim().max(2048).optional(),
  coverImageAlt: z.string().trim().max(240).optional(),
  seoTitle: z.string().trim().max(120).optional(),
  seoDescription: z.string().trim().max(320).optional(),
  relatedProductIds: z.array(z.string().min(1)).max(30),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

const DUMMY_PASSWORD_HASH = "$2b$12$8MvMOmWtBeh7ZgsXjnucKeos73zUTGXXKA2sDr2o5xOtu6wxk/F6K";

function requireDatabase() {
  if (!isDatabaseConfigured) {
    throw new Error("DATABASE_URL is not configured. Copy .env.example to .env.local and run the Prisma migration.");
  }
}

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) redirect("/admin/login");
}

function normalizeOptional(value) {
  const text = String(value || "").trim();
  return text || null;
}

function parseImages(value, productName) {
  return String(value || "")
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url, index) => ({ url, alt: productName, sortOrder: index }));
}

function parseSpecifications(value) {
  return String(value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const separator = line.indexOf(":");
      return {
        label: separator === -1 ? `Specification ${index + 1}` : line.slice(0, separator).trim(),
        value: separator === -1 ? line : line.slice(separator + 1).trim(),
        sortOrder: index,
      };
    });
}

function productData(formData) {
  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    modelNumber: formData.get("modelNumber"),
    categoryId: formData.get("categoryId"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    imageUrls: formData.get("imageUrls"),
    specifications: formData.get("specifications"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
  };
  return productSchema.parse(raw);
}

function categoryData(formData) {
  return categorySchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    sortOrder: formData.get("sortOrder"),
  });
}

function knowledgeArticleData(formData) {
  const coverImageUrl = String(formData.get("coverImageUrls") || "")
    .split("\n")
    .map((value) => value.trim())
    .find(Boolean) || "";
  return knowledgeArticleSchema.parse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    category: formData.get("category"),
    status: formData.get("status"),
    featured: formData.get("featured") === "on",
    authorName: formData.get("authorName"),
    reviewerName: formData.get("reviewerName"),
    coverImageUrl,
    coverImageAlt: formData.get("coverImageAlt"),
    seoTitle: formData.get("seoTitle"),
    seoDescription: formData.get("seoDescription"),
    relatedProductIds: [...new Set(formData.getAll("relatedProductIds").map(String))],
  });
}

function estimateReadingMinutes(html) {
  const text = String(html || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (!text) return 1;
  return Math.max(1, Math.ceil(text.split(" ").length / 220));
}

function isUniqueConstraintError(error) {
  return Boolean(error && typeof error === "object" && error.code === "P2002");
}

function isForeignKeyConstraintError(error) {
  return Boolean(error && typeof error === "object" && error.code === "P2003");
}

export async function loginAction(formData) {
  if (!process.env.AUTH_SECRET || !isDatabaseConfigured) redirect("/admin/login?error=setup");

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/admin/login?error=invalid");

  let user;
  try {
    user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  } catch {
    redirect("/admin/login?error=setup");
  }

  const passwordMatches = await bcrypt.compare(
    parsed.data.password,
    user?.passwordHash || DUMMY_PASSWORD_HASH,
  );
  if (!user || !passwordMatches) redirect("/admin/login?error=invalid");

  await createAdminSession(user);
  redirect("/admin/products");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}

export async function createProductAction(formData) {
  await requireAdmin();
  requireDatabase();
  const input = productData(formData);
  const images = parseImages(input.imageUrls, input.name);
  const specifications = parseSpecifications(input.specifications);

  const product = await prisma.product.create({
    data: {
      name: input.name,
      slug: input.slug,
      modelNumber: normalizeOptional(input.modelNumber),
      categoryId: input.categoryId,
      shortDescription: input.shortDescription,
      description: normalizeOptional(sanitizeRichText(input.description)),
      status: input.status,
      featured: input.featured,
      seoTitle: normalizeOptional(input.seoTitle),
      seoDescription: normalizeOptional(input.seoDescription),
      publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      images: { create: images },
      specifications: { create: specifications },
    },
  });

  revalidatePath("/");
  revalidatePath("/products");
  redirect(`/admin/products/${product.id}/edit?created=1`);
}

export async function updateProductAction(id, formData) {
  await requireAdmin();
  requireDatabase();
  const input = productData(formData);
  const images = parseImages(input.imageUrls, input.name);
  const specifications = parseSpecifications(input.specifications);

  await prisma.$transaction(async (tx) => {
    await tx.productImage.deleteMany({ where: { productId: id } });
    await tx.productSpecification.deleteMany({ where: { productId: id } });
    await tx.product.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        modelNumber: normalizeOptional(input.modelNumber),
        categoryId: input.categoryId,
        shortDescription: input.shortDescription,
        description: normalizeOptional(sanitizeRichText(input.description)),
        status: input.status,
        featured: input.featured,
        seoTitle: normalizeOptional(input.seoTitle),
        seoDescription: normalizeOptional(input.seoDescription),
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        images: { create: images },
        specifications: { create: specifications },
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/products");
  revalidatePath(`/products/${input.slug}`);
  redirect(`/admin/products/${id}/edit?saved=1`);
}

export async function deleteProductAction(id) {
  await requireAdmin();
  requireDatabase();

  let result;
  try {
    result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id },
        select: {
          slug: true,
          category: { select: { slug: true } },
          _count: { select: { inquiryItems: true } },
        },
      });

      if (!product) return { status: "not-found" };
      if (product._count.inquiryItems > 0) return { status: "has-inquiries" };

      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productSpecification.deleteMany({ where: { productId: id } });
      await tx.product.delete({ where: { id } });
      return { status: "deleted", slug: product.slug, categorySlug: product.category?.slug };
    });
  } catch (error) {
    if (isForeignKeyConstraintError(error)) redirect("/admin/products?error=has-inquiries");
    throw error;
  }

  if (result.status !== "deleted") redirect(`/admin/products?error=${result.status}`);

  revalidatePath("/");
  revalidatePath("/products", "layout");
  revalidatePath(`/products/${result.slug}`);
  if (result.categorySlug) revalidatePath(`/products/category/${result.categorySlug}`);
  revalidatePath("/sitemap.xml");
  redirect("/admin/products?deleted=1");
}

export async function createCategoryAction(formData) {
  await requireAdmin();
  requireDatabase();
  let input;
  try {
    input = categoryData(formData);
  } catch {
    redirect("/admin/categories/new?error=validation");
  }

  let category;
  try {
    category = await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug,
        description: normalizeOptional(input.description),
        seoTitle: normalizeOptional(input.seoTitle),
        seoDescription: normalizeOptional(input.seoDescription),
        sortOrder: input.sortOrder,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) redirect("/admin/categories/new?error=slug");
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/products", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/categories");
  redirect(`/admin/categories/${category.id}/edit?created=1`);
}

export async function updateCategoryAction(id, formData) {
  await requireAdmin();
  requireDatabase();
  let input;
  try {
    input = categoryData(formData);
  } catch {
    redirect(`/admin/categories/${id}/edit?error=validation`);
  }

  try {
    await prisma.category.update({
      where: { id },
      data: {
        name: input.name,
        slug: input.slug,
        description: normalizeOptional(input.description),
        seoTitle: normalizeOptional(input.seoTitle),
        seoDescription: normalizeOptional(input.seoDescription),
        sortOrder: input.sortOrder,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) redirect(`/admin/categories/${id}/edit?error=slug`);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/products", "layout");
  revalidatePath(`/products/category/${input.slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/categories");
  redirect(`/admin/categories/${id}/edit?saved=1`);
}

export async function deleteCategoryAction(id) {
  await requireAdmin();
  requireDatabase();

  let result;
  try {
    result = await prisma.$transaction(async (tx) => {
      const category = await tx.category.findUnique({
        where: { id },
        select: { id: true, _count: { select: { products: true } } },
      });
      if (!category) return "not-found";
      if (category._count.products > 0) return "has-products";
      await tx.category.delete({ where: { id } });
      return "deleted";
    });
  } catch (error) {
    if (isForeignKeyConstraintError(error)) redirect("/admin/categories?error=has-products");
    throw error;
  }

  if (result !== "deleted") redirect(`/admin/categories?error=${result}`);
  revalidatePath("/");
  revalidatePath("/products", "layout");
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/categories");
  redirect("/admin/categories?deleted=1");
}

const whatsappSettingsSchema = z.object({
  whatsappEnabled: z.boolean(),
  whatsappNumber: z.string().trim().max(30),
  whatsappMessageTemplate: z.string().trim().min(1).max(1000),
});

const siteIdentitySchema = z.object({
  brandTitle: z.string().trim().min(1).max(40),
  brandSubtitle: z.string().trim().min(1).max(60),
});

export async function saveSiteIdentitySettingsAction(formData) {
  await requireAdmin();
  requireDatabase();
  const input = siteIdentitySchema.parse({
    brandTitle: formData.get("brandTitle"),
    brandSubtitle: formData.get("brandSubtitle"),
  });

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: input,
    create: {
      id: "site",
      ...input,
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/products", "layout");
  redirect("/admin/site-settings?saved=1");
}

export async function saveWhatsAppSettingsAction(formData) {
  await requireAdmin();
  requireDatabase();
  const input = whatsappSettingsSchema.parse({
    whatsappEnabled: formData.get("whatsappEnabled") === "on",
    whatsappNumber: formData.get("whatsappNumber"),
    whatsappMessageTemplate: formData.get("whatsappMessageTemplate"),
  });
  const number = input.whatsappNumber.replace(/\D/g, "");

  await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: {
      whatsappEnabled: input.whatsappEnabled,
      whatsappNumber: number,
      whatsappMessageTemplate: input.whatsappMessageTemplate,
    },
    create: {
      id: "site",
      whatsappEnabled: input.whatsappEnabled,
      whatsappNumber: number,
      whatsappMessageTemplate: input.whatsappMessageTemplate,
    },
  });

  revalidatePath("/products", "layout");
  redirect("/admin/whatsapp?saved=1");
}

export async function createKnowledgeArticleAction(formData) {
  await requireAdmin();
  requireDatabase();
  let input;
  try {
    input = knowledgeArticleData(formData);
  } catch {
    redirect("/admin/knowledge/new?error=validation");
  }
  const content = sanitizeRichText(input.content);
  let article;
  try {
    article = await prisma.knowledgeArticle.create({
      data: {
        title: input.title,
        slug: input.slug,
        excerpt: input.excerpt,
        content,
        category: input.category,
        status: input.status,
        featured: input.featured,
        authorName: input.authorName,
        reviewerName: normalizeOptional(input.reviewerName),
        coverImageUrl: normalizeOptional(input.coverImageUrl),
        coverImageAlt: normalizeOptional(input.coverImageAlt),
        seoTitle: normalizeOptional(input.seoTitle),
        seoDescription: normalizeOptional(input.seoDescription),
        readingMinutes: estimateReadingMinutes(content),
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
        relatedProducts: {
          create: input.relatedProductIds.map((productId) => ({ productId })),
        },
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) redirect("/admin/knowledge/new?error=slug");
    throw error;
  }

  revalidatePath("/knowledge", "layout");
  revalidatePath("/sitemap.xml");
  redirect(`/admin/knowledge/${article.id}/edit?created=1`);
}

export async function updateKnowledgeArticleAction(id, formData) {
  await requireAdmin();
  requireDatabase();
  let input;
  try {
    input = knowledgeArticleData(formData);
  } catch {
    redirect(`/admin/knowledge/${id}/edit?error=validation`);
  }
  const content = sanitizeRichText(input.content);

  let previous;
  try {
    previous = await prisma.knowledgeArticle.findUnique({ where: { id }, select: { slug: true, publishedAt: true } });
    if (!previous) redirect("/admin/knowledge?error=not-found");
    await prisma.$transaction(async (tx) => {
      await tx.knowledgeArticleProduct.deleteMany({ where: { articleId: id } });
      await tx.knowledgeArticle.update({
        where: { id },
        data: {
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt,
          content,
          category: input.category,
          status: input.status,
          featured: input.featured,
          authorName: input.authorName,
          reviewerName: normalizeOptional(input.reviewerName),
          coverImageUrl: normalizeOptional(input.coverImageUrl),
          coverImageAlt: normalizeOptional(input.coverImageAlt),
          seoTitle: normalizeOptional(input.seoTitle),
          seoDescription: normalizeOptional(input.seoDescription),
          readingMinutes: estimateReadingMinutes(content),
          publishedAt: input.status === "PUBLISHED" ? (previous.publishedAt || new Date()) : null,
          relatedProducts: {
            create: input.relatedProductIds.map((productId) => ({ productId })),
          },
        },
      });
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) redirect(`/admin/knowledge/${id}/edit?error=slug`);
    throw error;
  }

  revalidatePath("/knowledge", "layout");
  revalidatePath(`/knowledge/${previous.slug}`);
  revalidatePath(`/knowledge/${input.slug}`);
  revalidatePath("/sitemap.xml");
  redirect(`/admin/knowledge/${id}/edit?saved=1`);
}

export async function deleteKnowledgeArticleAction(id) {
  await requireAdmin();
  requireDatabase();
  const article = await prisma.knowledgeArticle.findUnique({ where: { id }, select: { slug: true } });
  if (!article) redirect("/admin/knowledge?error=not-found");
  await prisma.knowledgeArticle.delete({ where: { id } });
  revalidatePath("/knowledge", "layout");
  revalidatePath(`/knowledge/${article.slug}`);
  revalidatePath("/sitemap.xml");
  redirect("/admin/knowledge?deleted=1");
}
