import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const KNOWLEDGE_CATEGORIES = [
  {
    value: "RF_FUNDAMENTALS",
    slug: "rf-fundamentals",
    name: "RF Fundamentals",
    description: "Clear explanations of RF frequencies, modulation, coding and wireless range.",
  },
  {
    value: "SELECTION_GUIDES",
    slug: "selection-guides",
    name: "Selection Guides",
    description: "Practical frameworks for choosing transmitters, receivers and control modes.",
  },
  {
    value: "ENGINEERING_TROUBLESHOOTING",
    slug: "engineering-troubleshooting",
    name: "Engineering & Troubleshooting",
    description: "Wiring, commissioning and diagnostic guidance for dependable RF control.",
  },
  {
    value: "APPLICATION_GUIDES",
    slug: "application-guides",
    name: "Application Guides",
    description: "Wireless control design for motors, access systems, equipment and smart devices.",
  },
];

const articleInclude = {
  relatedProducts: {
    include: {
      product: {
        include: {
          category: true,
          images: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
  },
};

export function getKnowledgeCategory(value) {
  return KNOWLEDGE_CATEGORIES.find((category) => category.value === value) || null;
}

export function getKnowledgeCategoryBySlug(slug) {
  return KNOWLEDGE_CATEGORIES.find((category) => category.slug === slug) || null;
}

export async function getKnowledgeArticles({ category, featured } = {}) {
  if (!isDatabaseConfigured) return [];
  try {
    return await prisma.knowledgeArticle.findMany({
      where: {
        status: "PUBLISHED",
        ...(category ? { category } : {}),
        ...(typeof featured === "boolean" ? { featured } : {}),
      },
      include: articleInclude,
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    });
  } catch {
    return [];
  }
}

export async function getKnowledgeArticleBySlug(slug, { includeDrafts = false } = {}) {
  if (!isDatabaseConfigured) return null;
  try {
    return await prisma.knowledgeArticle.findFirst({
      where: { slug, ...(includeDrafts ? {} : { status: "PUBLISHED" }) },
      include: articleInclude,
    });
  } catch {
    return null;
  }
}

export async function getKnowledgeArticleById(id) {
  if (!isDatabaseConfigured) return null;
  try {
    return await prisma.knowledgeArticle.findUnique({ where: { id }, include: articleInclude });
  } catch {
    return null;
  }
}

export async function getAdminKnowledgeArticlesPage({
  page = 1,
  pageSize = 10,
  query = "",
  category = "",
  status = "",
} = {}) {
  if (!isDatabaseConfigured) {
    return { articles: [], total: 0, totalPages: 1, currentPage: 1 };
  }

  const where = {
    ...(query.trim()
      ? {
          OR: [
            { title: { contains: query.trim(), mode: "insensitive" } },
            { slug: { contains: query.trim(), mode: "insensitive" } },
            { excerpt: { contains: query.trim(), mode: "insensitive" } },
          ],
        }
      : {}),
    ...(category ? { category } : {}),
    ...(status ? { status } : {}),
  };

  try {
    const total = await prisma.knowledgeArticle.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const articles = await prisma.knowledgeArticle.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (currentPage - 1) * pageSize,
      take: pageSize,
    });
    return { articles, total, totalPages, currentPage };
  } catch {
    return { articles: [], total: 0, totalPages: 1, currentPage: 1 };
  }
}
