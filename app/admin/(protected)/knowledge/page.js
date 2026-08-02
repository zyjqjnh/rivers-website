import Link from "next/link";
import { redirect } from "next/navigation";
import { BookOpenText, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { AdminProductPagination } from "@/components/admin/AdminProductPagination";
import { ArticleActions } from "@/components/admin/ArticleActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminKnowledgeArticlesPage, getKnowledgeCategory, KNOWLEDGE_CATEGORIES } from "@/lib/knowledge";
import { isDatabaseAvailable } from "@/lib/prisma";

export const dynamic = "force-dynamic";
const ARTICLES_PER_PAGE = 10;
const VALID_STATUSES = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);
const VALID_CATEGORIES = new Set(KNOWLEDGE_CATEGORIES.map((category) => category.value));

function knowledgeHref({ query, category, status, page }) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (category) params.set("category", category);
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `/admin/knowledge?${queryString}` : "/admin/knowledge";
}

export default async function AdminKnowledgePage({ searchParams }) {
  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q.trim() : "";
  const requestedCategory = typeof params?.category === "string" ? params.category.toUpperCase() : "";
  const category = VALID_CATEGORIES.has(requestedCategory) ? requestedCategory : "";
  const requestedStatus = typeof params?.status === "string" ? params.status.toUpperCase() : "";
  const status = VALID_STATUSES.has(requestedStatus) ? requestedStatus : "";
  const requestedPage = typeof params?.page === "string" && /^\d+$/.test(params.page) ? Number(params.page) : 1;
  const [result, databaseReady] = await Promise.all([
    getAdminKnowledgeArticlesPage({ page: requestedPage, pageSize: ARTICLES_PER_PAGE, query, category, status }),
    isDatabaseAvailable(),
  ]);
  const { articles, total, totalPages, currentPage } = result;
  const filters = { query, category, status };
  const hasFilters = Boolean(query || category || status);

  if (
    requestedPage !== currentPage || params?.page === "1" ||
    (params?.category && params.category !== category) ||
    (params?.status && params.status !== status) ||
    params?.q === "" || params?.category === "" || params?.status === ""
  ) redirect(knowledgeHref({ ...filters, page: currentPage }));

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Knowledge Center</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Articles</h1><p className="mt-2 text-sm text-muted-foreground">{total} {hasFilters ? "matching" : ""} technical article{total === 1 ? "" : "s"}.</p></div>
        <Button asChild><Link href="/admin/knowledge/new"><Plus />Add article</Link></Button>
      </div>
      {!databaseReady && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">PostgreSQL is unavailable, so Knowledge Center management is read-only.</div>}
      {params?.deleted && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Article deleted.</div>}
      {params?.error === "not-found" && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">That article no longer exists.</div>}
      <Card>
        <CardHeader>
          <CardTitle>Technical content</CardTitle>
          <CardDescription>Manage article content, publishing, categories and related products.</CardDescription>
          <form className="grid gap-3 pt-3 lg:grid-cols-[minmax(240px,1fr)_240px_180px_auto]" method="get">
            <div className="relative h-10"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" name="q" defaultValue={query} placeholder="Search title, summary or slug" aria-label="Search articles" /></div>
            <label className="relative"><span className="sr-only">Filter by category</span><select className="h-10 w-full appearance-none rounded-md border border-input bg-background px-3 pr-9 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring" name="category" defaultValue={category}><option value="">All categories</option>{KNOWLEDGE_CATEGORIES.map((item) => <option value={item.value} key={item.value}>{item.name}</option>)}</select><SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /></label>
            <label><span className="sr-only">Filter by status</span><select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring" name="status" defaultValue={status}><option value="">All statuses</option><option value="PUBLISHED">Published</option><option value="DRAFT">Draft</option><option value="ARCHIVED">Archived</option></select></label>
            <div className="flex gap-2"><Button className="flex-1 lg:flex-none" type="submit">Apply filters</Button>{hasFilters && <Button variant="ghost" size="icon" asChild aria-label="Clear all filters"><Link href="/admin/knowledge"><X /></Link></Button>}</div>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          {articles.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead>Article</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead>Updated</TableHead><TableHead className="w-[150px] text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>{articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell><div className="font-medium">{article.title}</div><div className="mt-1 max-w-xl truncate text-xs text-muted-foreground">/{article.slug}</div></TableCell>
                  <TableCell className="text-muted-foreground">{getKnowledgeCategory(article.category)?.name}</TableCell>
                  <TableCell><Badge variant={article.status === "PUBLISHED" ? "success" : article.status === "DRAFT" ? "warning" : "secondary"}>{article.status.toLowerCase()}</Badge></TableCell>
                  <TableCell className="text-muted-foreground">{new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(article.updatedAt)}</TableCell>
                  <TableCell><ArticleActions article={article} canDelete={databaseReady} /></TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center px-6 py-14 text-center"><BookOpenText className="mb-4 h-8 w-8 text-muted-foreground" /><h2 className="font-semibold">No articles found</h2><p className="mt-1 max-w-sm text-sm text-muted-foreground">Create the first technical guide or clear the selected filters.</p><Button className="mt-5" asChild><Link href="/admin/knowledge/new">Add article</Link></Button></div>
          )}
          <AdminProductPagination ariaLabel="Article list pagination" basePath="/admin/knowledge" currentPage={currentPage} filters={filters} totalPages={totalPages} />
        </CardContent>
      </Card>
    </>
  );
}
