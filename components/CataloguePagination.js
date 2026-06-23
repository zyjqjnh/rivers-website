import Link from "next/link";

function getVisiblePages(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages = new Set([1, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  return [...pages]
    .filter((page) => page >= 1 && page <= totalPages)
    .sort((a, b) => a - b)
    .reduce((items, page, index, sortedPages) => {
      if (index > 0 && page - sortedPages[index - 1] > 1) items.push("ellipsis");
      items.push(page);
      return items;
    }, []);
}

function pageHref(pathname, page) {
  return page === 1 ? pathname : `${pathname}?page=${page}`;
}

export function CataloguePagination({ currentPage, pathname, totalPages }) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav className="catalogue-pagination" aria-label="Product catalogue pagination">
      <Link
        className={`catalogue-pagination-direction${currentPage === 1 ? " disabled" : ""}`}
        href={pageHref(pathname, Math.max(1, currentPage - 1))}
        aria-disabled={currentPage === 1}
        tabIndex={currentPage === 1 ? -1 : undefined}
      >
        Previous
      </Link>
      <div className="catalogue-pagination-pages">
        {visiblePages.map((page, index) =>
          page === "ellipsis" ? (
            <span className="catalogue-pagination-ellipsis" aria-hidden="true" key={`ellipsis-${index}`}>
              …
            </span>
          ) : (
            <Link
              className="catalogue-pagination-page"
              href={pageHref(pathname, page)}
              aria-current={page === currentPage ? "page" : undefined}
              key={page}
            >
              {page}
            </Link>
          ),
        )}
      </div>
      <Link
        className={`catalogue-pagination-direction${currentPage === totalPages ? " disabled" : ""}`}
        href={pageHref(pathname, Math.min(totalPages, currentPage + 1))}
        aria-disabled={currentPage === totalPages}
        tabIndex={currentPage === totalPages ? -1 : undefined}
      >
        Next
      </Link>
    </nav>
  );
}
