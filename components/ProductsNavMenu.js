"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

export function ProductsNavMenu({ categories = [], onNavigate }) {
  const handleNavigate = (eventName, parameters) => {
    trackEvent(eventName, parameters);
    onNavigate?.();
  };

  return (
    <div className="products-nav-item">
      <Link className="products-nav-link" href="/products" onClick={() => handleNavigate("catalog_click", { cta_location: "navigation" })}>
        <span>Products</span>
        <ChevronDown aria-hidden="true" />
      </Link>
      {categories.length > 0 && (
        <div className="products-dropdown" aria-label="Product categories">
          <span className="products-dropdown-label">Product categories</span>
          {categories.map((category) => (
            <Link
              href={`/products/category/${encodeURIComponent(category.slug)}`}
              key={category.id}
              onClick={() => handleNavigate("category_click", { category_name: category.name, cta_location: "navigation" })}
            >
              <span>{category.name}</span>
              {category.description && <small>{category.description}</small>}
            </Link>
          ))}
          <Link className="products-dropdown-all" href="/products" onClick={() => handleNavigate("catalog_click", { cta_location: "navigation_dropdown" })}>
            View all products
          </Link>
        </div>
      )}
    </div>
  );
}
