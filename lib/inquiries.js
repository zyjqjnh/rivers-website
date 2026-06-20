import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function getInquiries() {
  if (!isDatabaseConfigured) return [];
  try {
    return await prisma.inquiry.findMany({
      include: { _count: { select: { items: true } } },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return [];
  }
}

export async function getInquiryById(id) {
  if (!isDatabaseConfigured) return null;
  try {
    return await prisma.inquiry.findUnique({
      where: { id },
      include: {
        items: {
          include: { product: { select: { id: true, name: true, slug: true, modelNumber: true } } },
        },
      },
    });
  } catch {
    return null;
  }
}
