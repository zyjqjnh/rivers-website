import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { demoCategories, demoProducts } from "@/lib/demo-data";

const include = {
  category: true,
  images: { orderBy: { sortOrder: "asc" } },
  specifications: { orderBy: { sortOrder: "asc" } },
};

function productInclude({ includeCounts = false } = {}) {
  return {
    ...include,
    ...(includeCounts ? { _count: { select: { inquiryItems: true } } } : {}),
  };
}

export async function getProducts({ includeDrafts = false, featured, includeCounts = false } = {}) {
  const fallback = () => demoProducts.filter((product) =>
    (includeDrafts || product.status === "PUBLISHED") &&
    (typeof featured !== "boolean" || product.featured === featured)
  ).map((product) => includeCounts ? { ...product, _count: { inquiryItems: 0 } } : product);
  if (!isDatabaseConfigured) {
    return fallback();
  }
  try {
    return await prisma.product.findMany({
      where: {
        ...(includeDrafts ? {} : { status: "PUBLISHED" }),
        ...(typeof featured === "boolean" ? { featured } : {}),
      },
      include: productInclude({ includeCounts }),
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });
  } catch {
    return fallback();
  }
}

export async function getAdminProductsPage({
  page = 1,
  pageSize = 10,
  query = "",
  categoryId = "",
  status = "",
} = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  const matchesFallback = (product) => (
    (!normalizedQuery || [product.name, product.modelNumber, product.slug]
      .some((value) => value?.toLowerCase().includes(normalizedQuery))) &&
    (!categoryId || product.categoryId === categoryId) &&
    (!status || product.status === status)
  );
  const fallback = () => {
    const filteredProducts = demoProducts
      .filter(matchesFallback)
      .map((product) => ({ ...product, _count: { inquiryItems: 0 } }));
    const total = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    return {
      products: filteredProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize),
      total,
      totalPages,
      currentPage,
    };
  };

  if (!isDatabaseConfigured) return fallback();

  const where = {
    ...(query.trim() ? {
      OR: [
        { name: { contains: query.trim(), mode: "insensitive" } },
        { modelNumber: { contains: query.trim(), mode: "insensitive" } },
        { slug: { contains: query.trim(), mode: "insensitive" } },
      ],
    } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(status ? { status } : {}),
  };

  try {
    const total = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const products = await prisma.product.findMany({
      where,
      include: productInclude({ includeCounts: true }),
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });
    return { products, total, totalPages, currentPage };
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
