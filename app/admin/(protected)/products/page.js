import Link from "next/link";
import { redirect } from "next/navigation";
import { Download, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { AdminProductPagination } from "@/components/admin/AdminProductPagination";
import { ProductActions } from "@/components/admin/ProductActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAdminProductsPage, getCategories } from "@/lib/products";
import { isDatabaseAvailable } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const PRODUCTS_PER_PAGE = 10;
const VALID_STATUSES = new Set(["DRAFT", "PUBLISHED", "ARCHIVED"]);

function productsHref({ query, categoryId, status, page }) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (categoryId) params.set("category", categoryId);
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `/admin/products?${queryString}` : "/admin/products";
}

export default async function AdminProductsPage({ searchParams }) {
  const params = await searchParams;
  const query = typeof params?.q === "string" ? params.q.trim() : "";
  const categoryId = typeof params?.category === "string" ? params.category : "";
  const requestedStatus = typeof params?.status === "string" ? params.status.toUpperCase() : "";
  const status = VALID_STATUSES.has(requestedStatus) ? requestedStatus : "";
  const requestedPage = typeof params?.page === "string" && /^\d+$/.test(params.page) ? Number(params.page) : 1;
  const [result, categories, databaseReady] = await Promise.all([
    getAdminProductsPage({ page: requestedPage, pageSize: PRODUCTS_PER_PAGE, query, categoryId, status }),
    getCategories(),
    isDatabaseAvailable(),
  ]);
  const { products, total, totalPages, currentPage } = result;
  const filters = { query, categoryId, status };
  const hasFilters = Boolean(query || categoryId || status);

  if (
    requestedPage !== currentPage ||
    params?.page === "1" ||
    (params?.status && params.status !== status) ||
    params?.q === "" ||
    params?.category === "" ||
    params?.status === ""
  ) {
    redirect(productsHref({ ...filters, page: currentPage }));
  }

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Catalogue</p><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Products</h1><p className="mt-2 text-sm text-muted-foreground">{total} {hasFilters ? "matching" : ""} product{total === 1 ? "" : "s"} across the current catalogue.</p></div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild><Link href="/admin/products/import"><Download />Import from Alibaba</Link></Button>
          <Button asChild><Link href="/admin/products/new"><Plus />Add product</Link></Button>
        </div>
      </div>
      {!databaseReady && <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">PostgreSQL is unavailable, so the catalogue is temporarily shown in read-only demo mode.</div>}
      {params?.deleted && <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">Product deleted.</div>}
      {params?.error === "has-inquiries" && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">This product cannot be deleted because one or more inquiries reference it. Archive it instead if it should be hidden from the public catalogue.</div>}
      {params?.error === "not-found" && <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900">That product was already deleted or could not be found.</div>}
      <Card>
        <CardHeader>
          <CardTitle>Product catalogue</CardTitle>
          <CardDescription>Manage publishing status, content and public product pages.</CardDescription>
          <form className="grid gap-3 pt-3 lg:grid-cols-[minmax(240px,1fr)_220px_180px_auto]" method="get">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" name="q" defaultValue={query} placeholder="Search name, model or slug" aria-label="Search products" />
            </div>
            <label className="relative">
              <span className="sr-only">Filter by category</span>
              <select className="h-10 w-full appearance-none rounded-md border border-input bg-background px-3 pr-9 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring" name="category" defaultValue={categoryId}>
                <option value="">All categories</option>
                {categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}
              </select>
              <SlidersHorizontal className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </label>
            <label>
              <span className="sr-only">Filter by status</span>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring" name="status" defaultValue={status}>
                <option value="">All statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </label>
            <div className="flex gap-2">
              <Button className="flex-1 lg:flex-none" type="submit">Apply filters</Button>
              {hasFilters && <Button variant="ghost" size="icon" asChild aria-label="Clear all filters"><Link href="/admin/products"><X /></Link></Button>}
            </div>
          </form>
        </CardHeader>
        <CardContent className="p-0">
          {products.length > 0 ? (
            <Table>
              <TableHeader><TableRow><TableHead className="w-[72px]">Image</TableHead><TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Status</TableHead><TableHead className="w-[180px] text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell><img className="h-12 w-12 rounded-md border bg-slate-50 object-contain p-1" src={product.images?.[0]?.url || "/assets/67d6ba3c0e8ef810.jpg"} alt="" /></TableCell>
                    <TableCell><div className="font-medium">{product.name}</div><div className="mt-1 text-xs text-muted-foreground">{product.modelNumber || "No model number"}</div></TableCell>
                    <TableCell className="text-muted-foreground">{product.category?.name}</TableCell>
                    <TableCell><Badge variant={product.status === "PUBLISHED" ? "success" : product.status === "DRAFT" ? "warning" : "secondary"}>{product.status.toLowerCase()}</Badge></TableCell>
                    <TableCell><ProductActions product={product} canDelete={databaseReady} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center px-6 py-14 text-center">
              <Search className="mb-4 h-8 w-8 text-muted-foreground" />
              <h2 className="font-semibold">No products found</h2>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">Try a different keyword or clear one of the selected filters.</p>
              <Button className="mt-5" variant="outline" asChild><Link href="/admin/products">Clear filters</Link></Button>
            </div>
          )}
          <AdminProductPagination currentPage={currentPage} filters={filters} totalPages={totalPages} />
        </CardContent>
      </Card>
    </>
  );
}
