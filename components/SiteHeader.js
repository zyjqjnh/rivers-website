import Link from "next/link";
import { ProductsNavMenu } from "@/components/ProductsNavMenu";

export function SiteHeader({ categories = [] }) {
  return (
    <header className="simple-header">
      <Link className="brand" href="/">RIVERS<span>RF CONTROL</span></Link>
      <nav className="simple-nav">
        <ProductsNavMenu categories={categories} />
        <Link href="/#capabilities">Capabilities</Link>
        <Link href="/admin">Admin</Link>
      </nav>
    </header>
  );
}
