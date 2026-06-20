"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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
  sortOrder: z.coerce.number().int().min(0).max(100000),
});

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
    sortOrder: formData.get("sortOrder"),
  });
}

function isUniqueConstraintError(error) {
  return Boolean(error && typeof error === "object" && error.code === "P2002");
}

function isForeignKeyConstraintError(error) {
  return Boolean(error && typeof error === "object" && error.code === "P2003");
}

export async function loginAction(formData) {
  const password = String(formData.get("password") || "");
  if (!process.env.ADMIN_PASSWORD || !process.env.AUTH_SECRET) redirect("/admin/login?error=setup");
  if (password !== process.env.ADMIN_PASSWORD) redirect("/admin/login?error=invalid");
  await createAdminSession();
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
  await prisma.product.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/products");
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
        sortOrder: input.sortOrder,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) redirect("/admin/categories/new?error=slug");
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/products", "layout");
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
        sortOrder: input.sortOrder,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) redirect(`/admin/categories/${id}/edit?error=slug`);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/products", "layout");
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
  revalidatePath("/admin/categories");
  redirect("/admin/categories?deleted=1");
}

const whatsappSettingsSchema = z.object({
  whatsappEnabled: z.boolean(),
  whatsappNumber: z.string().trim().max(30),
  whatsappMessageTemplate: z.string().trim().min(1).max(1000),
});

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
