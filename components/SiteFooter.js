import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { CONTACT_EMAIL, CONTACT_EMAIL_HREF } from "@/lib/contact";

export function SiteFooter({ brand, href = "/", className = "" }) {
  return (
    <footer className={className || undefined}>
      <BrandLogo brand={brand} href={href} className="footer-brand" theme="dark" />
      <div className="footer-contact">
        <p>RF remote controls, receivers, modules and <Link href="/knowledge">technical guidance</Link>.</p>
        <a className="footer-email" href={CONTACT_EMAIL_HREF}>
          <span>Email us</span>
          {CONTACT_EMAIL}
        </a>
      </div>
      <p>© 2026 Anqing Rivers Electronic Technology Co., Ltd.</p>
    </footer>
  );
}
