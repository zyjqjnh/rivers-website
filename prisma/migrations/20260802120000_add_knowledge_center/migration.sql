CREATE TYPE "KnowledgeArticleStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

CREATE TYPE "KnowledgeCategory" AS ENUM ('RF_FUNDAMENTALS', 'SELECTION_GUIDES', 'ENGINEERING_TROUBLESHOOTING', 'APPLICATION_GUIDES');

CREATE TABLE "KnowledgeArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" "KnowledgeCategory" NOT NULL,
    "status" "KnowledgeArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "coverImageUrl" TEXT,
    "coverImageAlt" TEXT,
    "authorName" TEXT NOT NULL DEFAULT 'ANRIVERS Engineering Team',
    "reviewerName" TEXT,
    "readingMinutes" INTEGER NOT NULL DEFAULT 1,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "KnowledgeArticle_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeArticleProduct" (
    "articleId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeArticleProduct_pkey" PRIMARY KEY ("articleId", "productId")
);

CREATE UNIQUE INDEX "KnowledgeArticle_slug_key" ON "KnowledgeArticle"("slug");
CREATE INDEX "KnowledgeArticle_status_publishedAt_idx" ON "KnowledgeArticle"("status", "publishedAt");
CREATE INDEX "KnowledgeArticle_category_status_publishedAt_idx" ON "KnowledgeArticle"("category", "status", "publishedAt");
CREATE INDEX "KnowledgeArticle_featured_status_idx" ON "KnowledgeArticle"("featured", "status");
CREATE INDEX "KnowledgeArticleProduct_productId_idx" ON "KnowledgeArticleProduct"("productId");

ALTER TABLE "KnowledgeArticleProduct" ADD CONSTRAINT "KnowledgeArticleProduct_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "KnowledgeArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "KnowledgeArticleProduct" ADD CONSTRAINT "KnowledgeArticleProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
