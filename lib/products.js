import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { demoCategories, demoProducts } from "@/lib/demo-data";

const include = {
  category: true,
  images: { orderBy: { sortOrder: "asc" } },
  specifications: { orderBy: { sortOrder: "asc" } },
};

export async function getProducts({ includeDrafts = false, featured } = {}) {
  const fallback = () => demoProducts.filter((product) =>
    (includeDrafts || product.status === "PUBLISHED") &&
    (typeof featured !== "boolean" || product.featured === featured)
  );
  if (!isDatabaseConfigured) {
    return fallback();
  }
  try {
    return await prisma.product.findMany({
      where: {
        ...(includeDrafts ? {} : { status: "PUBLISHED" }),
        ...(typeof featured === "boolean" ? { featured } : {}),
      },
      include,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    return fallback();
  }
}

export async function getProductBySlug(slug, { includeDrafts = false } = {}) {
  if (!isDatabaseConfigured) {
    return demoProducts.find((product) => product.slug === slug && (includeDrafts || product.status === "PUBLISHED")) ?? null;
  }
  try {
    return await prisma.product.findFirst({ where: { slug, ...(includeDrafts ? {} : { status: "PUBLISHED" }) }, include });
  } catch {
    return demoProducts.find((product) => product.slug === slug && (includeDrafts || product.status === "PUBLISHED")) ?? null;
  }
}

export async function getProductById(id) {
  if (!isDatabaseConfigured) return demoProducts.find((product) => product.id === id) ?? null;
  try {
    return await prisma.product.findUnique({ where: { id }, include });
  } catch {
    return demoProducts.find((product) => product.id === id) ?? null;
  }
}

export async function getCategories() {
  if (!isDatabaseConfigured) return demoCategories;
  try {
    return await prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
  } catch {
    return demoCategories;
  }
}

export async function getAdminCategories() {
  const fallback = () => demoCategories.map((category) => ({
    ...category,
    _count: { products: demoProducts.filter((product) => product.categoryId === category.id).length },
  }));
  if (!isDatabaseConfigured) return fallback();
  try {
    return await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  } catch {
    return fallback();
  }
}

export async function getCategoryById(id) {
  if (!isDatabaseConfigured) return demoCategories.find((category) => category.id === id) ?? null;
  try {
    return await prisma.category.findUnique({ where: { id } });
  } catch {
    return demoCategories.find((category) => category.id === id) ?? null;
  }
}

export async function getCategoryBySlug(slug) {
  if (!isDatabaseConfigured) return demoCategories.find((category) => category.slug === slug) ?? null;
  try {
    return await prisma.category.findUnique({ where: { slug } });
  } catch {
    return demoCategories.find((category) => category.slug === slug) ?? null;
  }
}
