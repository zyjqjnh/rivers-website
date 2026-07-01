import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1);
  return [...new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1])]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b);
}

function pageHref(page, filters) {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.categoryId) params.set("category", filters.categoryId);
  if (filters.status) params.set("status", filters.status);
  if (page > 1) params.set("page", String(page));
  const queryString = params.toString();
  return queryString ? `/admin/products?${queryString}` : "/admin/products";
}

export function AdminProductPagination({ currentPage, filters, totalPages }) {
  if (totalPages <= 1) return null;
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-4" aria-label="Product list pagination">
      <Button variant="outline" size="sm" asChild={currentPage > 1} disabled={currentPage === 1}>
        {currentPage > 1
          ? <Link href={pageHref(currentPage - 1, filters)}><ChevronLeft />Previous</Link>
          : <span><ChevronLeft />Previous</span>}
      </Button>
      <div className="flex items-center gap-1">
        {visiblePages.map((page, index) => {
          const previousPage = visiblePages[index - 1];
          return (
            <span className="contents" key={page}>
              {previousPage && page - previousPage > 1 && <span className="px-1 text-sm text-muted-foreground">…</span>}
              <Button
                variant={page === currentPage ? "default" : "ghost"}
                size="icon"
                className="h-9 w-9"
                asChild={page !== currentPage}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page === currentPage ? <span>{page}</span> : <Link href={pageHref(page, filters)}>{page}</Link>}
              </Button>
            </span>
          );
        })}
      </div>
      <Button variant="outline" size="sm" asChild={currentPage < totalPages} disabled={currentPage === totalPages}>
        {currentPage < totalPages
          ? <Link href={pageHref(currentPage + 1, filters)}>Next<ChevronRight /></Link>
          : <span>Next<ChevronRight /></span>}
      </Button>
    </nav>
  );
}
