"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Braces,
  Factory,
  HardHat,
  House,
  LockKeyhole,
  RadioTower,
  ShieldCheck,
  SlidersHorizontal,
  Sprout,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { InquiryModal } from "@/components/InquiryModal";
import { ProductsNavMenu } from "@/components/ProductsNavMenu";
import { trackEvent } from "@/lib/analytics";

const solutionTiles = [
  {
    title: "Gate & Access Control",
    description: "Open gates, barriers and access points from a safe distance with dependable RF control.",
    image: "/solutions/gate-access-control.png",
    href: "/products/category/remote-controllers",
    className: "solution-tile gate-tile",
  },
  {
    title: "Motor, Pump & Winch Control",
    description: "Start, stop and regulate motors, pumps and winches with precise wireless commands.",
    image: "/solutions/motor-pump-control.png",
    href: "/products/category/receivers-switches",
    className: "solution-tile pump-tile reverse",
  },
  {
    title: "Lighting & Home Automation",
    description: "Control lighting, scenes and connected devices wirelessly—indoors or outdoors.",
    image: "/solutions/lighting-home-automation.png",
    href: "/products/category/receivers-switches",
    className: "solution-tile home-tile reverse",
  },
  {
    title: "Security & Alarm Systems",
    description: "Arm, disarm, trigger alarms and monitor zones with secure, dependable RF.",
    image: "/assets/1e60bd480a0609fc.jpg",
    href: "/products/category/sensors",
    className: "solution-tile security-tile",
    contain: true,
  },
];

const industries = [
  [Factory, "Industrial Automation"],
  [LockKeyhole, "Access & Security"],
  [House, "Smart Home"],
  [Sprout, "Agriculture"],
  [HardHat, "Construction"],
];

export function SolutionsClient({ categories, brand }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);

  const openInquiry = (ctaLocation) => {
    trackEvent("rfq_start", { cta_location: ctaLocation, page_name: "solutions" });
    setInquiryOpen(true);
  };

  const trackSolution = (solutionName) => {
    trackEvent("solution_click", { solution_name: solutionName, page_name: "solutions" });
    setMenuOpen(false);
  };

  return (
    <div className="solutions-shell">
      <header className="site-header solutions-header">
        <BrandLogo brand={brand} ariaLabel={`${brand.title} ${brand.subtitle} home`} />
        <button className="menu-button" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "Close" : "Menu"}
        </button>
        <nav className={menuOpen ? "nav open" : "nav"} aria-label="Main navigation">
          <ProductsNavMenu categories={categories} onNavigate={() => setMenuOpen(false)} />
          <Link href="/knowledge" onClick={() => setMenuOpen(false)}>Knowledge</Link>
          <Link className="active" href="/solutions" onClick={() => setMenuOpen(false)}>Solutions</Link>
          <Link href="/#capabilities" onClick={() => setMenuOpen(false)}>Capabilities</Link>
          <Link href="/#about" onClick={() => setMenuOpen(false)}>About</Link>
        </nav>
        <button className="header-cta" type="button" onClick={() => openInquiry("solutions_header")}>Start an RFQ</button>
      </header>

      <main>
        <section className="solutions-hero">
          <div className="solutions-hero-copy">
            <p className="eyebrow">FIELD APPLICATIONS</p>
            <h1>Wireless control for the equipment that keeps work moving.</h1>
            <p>Reliable RF control where wired systems are impractical or impossible. Built for OEMs and industrial teams that need safe, flexible control in real-world conditions.</p>
          </div>
          <div className="solutions-hero-image">
            <Image src="/solutions/industrial-crane-hero-v2.png" alt="Industrial operator monitoring lifting equipment in a crane yard" fill priority sizes="(max-width: 900px) 100vw, 55vw" />
          </div>
        </section>

        <section className="featured-solution" id="industrial-equipment" aria-labelledby="featured-solution-title">
          <div className="featured-solution-copy">
            <span>FEATURED SOLUTION</span>
            <h2 id="featured-solution-title">Industrial Equipment Control</h2>
            <p>Wireless control for mobile and fixed industrial equipment. Safer operation, precise response and the range to keep teams productive.</p>
            <Link href="/products/category/remote-controllers" onClick={() => trackSolution("Industrial Equipment Control")}>Explore control hardware <ArrowRight aria-hidden="true" /></Link>
          </div>
          <div className="featured-scene">
            <Image src="/solutions/industrial-equipment-control.png" alt="Operator monitoring industrial equipment beneath an overhead crane" fill sizes="(max-width: 900px) 100vw, 38vw" />
          </div>
          <div className="featured-products" aria-label="ANRIVERS industrial RF products">
            <Image src="/assets/67d6ba3c0e8ef810.jpg" alt="ANRIVERS 12-key long range industrial remote controls" width={720} height={720} sizes="(max-width: 900px) 55vw, 24vw" />
            <Image src="/assets/9e20d569296ac1e0.jpg" alt="ANRIVERS remote control and relay receiver kit" width={720} height={720} sizes="(max-width: 900px) 45vw, 18vw" />
          </div>
        </section>

        <section className="solution-proof" aria-label="Industrial RF control capabilities">
          <div><RadioTower aria-hidden="true" /><span><strong>Long range</strong>Up to 2000 m line-of-sight for confident control.</span></div>
          <div><SlidersHorizontal aria-hidden="true" /><span><strong>Configurable channels</strong>From 1 to 12 channels, matched to your application.</span></div>
          <div><ShieldCheck aria-hidden="true" /><span><strong>Rugged operation</strong>Selected around dust, vibration, moisture and temperature.</span></div>
          <div><Braces aria-hidden="true" /><span><strong>Custom control logic</strong>Application-specific functions and safety interlocks.</span></div>
        </section>

        <section className="solutions-mosaic" id="solution-applications" aria-label="RF control applications">
          {solutionTiles.map((tile) => (
            <article className={tile.className} key={tile.title}>
              <div className={`solution-tile-image${tile.contain ? " contain" : ""}`}>
                <Image src={tile.image} alt="" fill sizes="(max-width: 760px) 100vw, 33vw" />
              </div>
              <div className="solution-tile-copy">
                <h2>{tile.title}</h2>
                <p>{tile.description}</p>
                <Link href={tile.href} aria-label={`Explore products for ${tile.title}`} onClick={() => trackSolution(tile.title)}><ArrowRight aria-hidden="true" /></Link>
              </div>
            </article>
          ))}

          <article className="oem-solution">
            <div className="solution-tile-copy">
              <h2>OEM RF Integration</h2>
              <p>Integrate robust RF control into your product or platform with compact modules and development support.</p>
              <Link href="/products/category/rf-modules" aria-label="Explore RF modules for OEM integration" onClick={() => trackSolution("OEM RF Integration")}><ArrowRight aria-hidden="true" /></Link>
            </div>
            <div className="oem-products">
              <Image src="/assets/c3329360a0cec71d.jpg" alt="ANRIVERS 433 MHz learning-code receiver module" width={960} height={720} sizes="(max-width: 760px) 100vw, 62vw" />
            </div>
          </article>
        </section>

        <section className="industries-strip" id="industries" aria-labelledby="industries-title">
          <p className="eyebrow" id="industries-title">INDUSTRIES WE SUPPORT</p>
          <div>
            {industries.map(([Icon, label]) => <span key={label}><Icon aria-hidden="true" />{label}</span>)}
          </div>
        </section>

        <section className="solutions-rfq" id="solution-rfq">
          <div>
            <h2>Tell us what needs to move, switch or respond.</h2>
            <p>Our engineers will help you define the right RF control solution for your application.</p>
          </div>
          <button className="signal-button" type="button" onClick={() => openInquiry("solutions_footer")}>Start an RFQ</button>
        </section>
      </main>

      <footer>
        <BrandLogo brand={brand} className="footer-brand" theme="dark" />
        <p>RF remote controls, receivers, modules and <Link href="/knowledge">technical guidance</Link>.</p>
        <p>© 2026 Anqing Rivers Electronic Technology Co., Ltd.</p>
      </footer>

      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
