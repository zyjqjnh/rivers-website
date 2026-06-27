import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { getCategories } from "@/lib/products";
import { getBrand, getSiteSettings } from "@/lib/site-settings";

export const metadata = {
  title: "Page not found",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function NotFound() {
  const [categories, siteSettings] = await Promise.all([
    getCategories(),
    getSiteSettings(),
  ]);
  const brand = getBrand(siteSettings);

  return (
    <div className="not-found-shell">
      <SiteHeader categories={categories} />

      <main className="not-found-main">
        <section className="not-found-copy" aria-labelledby="not-found-title">
          <p className="eyebrow">ERROR 404 · ROUTE NOT FOUND</p>
          <h1 id="not-found-title">Signal lost.</h1>
          <p className="not-found-description">
            The page you requested is outside our current range. Check the address,
            or use one of the routes below to reconnect.
          </p>
          <div className="not-found-actions">
            <Link className="primary-button not-found-primary" href="/">
              <ArrowLeft aria-hidden="true" />
              Return home
            </Link>
            <Link className="not-found-secondary" href="/products">
              Browse products
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </section>

        <aside className="not-found-panel" aria-label="404 route status">
          <div className="not-found-panel-topline">
            <span>ROUTE DIAGNOSTIC</span>
            <span className="not-found-status"><i /> OFFLINE</span>
          </div>
          <strong className="not-found-code" aria-hidden="true">404</strong>
          <div className="not-found-readout">
            <div>
              <span>REQUEST STATUS</span>
              <strong>PAGE NOT FOUND</strong>
            </div>
            <div>
              <span>RECOMMENDED ACTION</span>
              <strong>RETURN TO BASE</strong>
            </div>
          </div>
        </aside>
      </main>

      <footer className="not-found-footer">
        <Link className="brand footer-brand" href="/">
          {brand.title}<span>{brand.subtitle}</span>
        </Link>
        <p>RF remote controls, receivers, modules and sensors.</p>
        <p>© 2026 Anqing Rivers Electronic Technology Co., Ltd.</p>
      </footer>
    </div>
  );
}
