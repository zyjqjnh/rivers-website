import Link from "next/link";
import { ChevronDown } from "lucide-react";

export function ProductsNavMenu({ categories = [], onNavigate }) {
  return (
    <div className="products-nav-item">
      <Link className="products-nav-link" href="/products" onClick={onNavigate}>
        <span>Products</span>
        <ChevronDown aria-hidden="true" />
      </Link>
      {categories.length > 0 && (
        <div className="products-dropdown" aria-label="Product categories">
          <span className="products-dropdown-label">Product categories</span>
          {categories.map((category) => (
            <Link
              href={`/products?category=${encodeURIComponent(category.slug)}`}
              key={category.id}
              onClick={onNavigate}
            >
              <span>{category.name}</span>
              {category.description && <small>{category.description}</small>}
            </Link>
          ))}
          <Link className="products-dropdown-all" href="/products" onClick={onNavigate}>
            View all products
          </Link>
        </div>
      )}
    </div>
  );
}
