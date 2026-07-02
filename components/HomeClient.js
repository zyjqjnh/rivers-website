"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { ProductsNavMenu } from "@/components/ProductsNavMenu";
import { InquiryModal } from "@/components/InquiryModal";

const fallbackFamilies = [
  { name: "Remote Controllers", description: "Handheld and industrial transmitters from compact key fobs to 12-channel control.", specs: "315 / 433.92 / 868 MHz", image: "/assets/67d6ba3c0e8ef810.jpg", slug: "12-key-long-range-industrial-remote" },
  { name: "Receivers & Switches", description: "Reliable relay receivers for access control, motors, lighting and automation.", specs: "1–12 channels · 3–265V", image: "/assets/9e20d569296ac1e0.jpg", slug: "8-channel-relay-receiver-kit" },
  { name: "RF Modules", description: "Compact receiver and decoder modules ready to integrate into your device.", specs: "EV1527 · Learning code", image: "/assets/c3329360a0cec71d.jpg", slug: "433mhz-learning-code-receiver-module" },
  { name: "Sensors", description: "Wireless PIR and security sensors for alarms, smart homes and safety systems.", specs: "Low power · Long standby", image: "/assets/1e60bd480a0609fc.jpg", slug: "wireless-pir-motion-sensor" },
];

const applications = [
  ["Access Control", "Gate openers, locks and garage doors"],
  ["Motor Control", "Forward, reverse, up and down control"],
  ["Lighting", "Low-voltage LEDs and mains-powered lamps"],
  ["Smart Devices", "Battery products and integrated electronics"],
];

function productToFamily(product, index) {
  const specs = product.specifications?.slice(0, 2).map((item) => item.value).join(" · ");
  return {
    name: product.category?.name || product.name,
    description: product.shortDescription || fallbackFamilies[index]?.description,
    specs: specs || fallbackFamilies[index]?.specs,
    image: product.images?.[0]?.url || fallbackFamilies[index]?.image,
    slug: product.slug,
  };
}

export function HomeClient({ products, categories, brand }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(0);
  const families = useMemo(() => {
    const mapped = products.map(productToFamily);
    return fallbackFamilies.map((fallback, index) => mapped[index] || fallback);
  }, [products]);

  const openInquiry = () => {
    setInquiryOpen(true);
  };

  return (
    <div className="site-shell">
      <header className="site-header">
        <BrandLogo brand={brand} href="#top" ariaLabel={`${brand.title} ${brand.subtitle} home`} />
        <button className="menu-button" type="button" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? "Close" : "Menu"}</button>
        <nav className={menuOpen ? "nav open" : "nav"} aria-label="Main navigation">
          <ProductsNavMenu categories={categories} onNavigate={() => setMenuOpen(false)} />
          <Link href="#applications" onClick={() => setMenuOpen(false)}>Applications</Link>
          <Link href="#capabilities" onClick={() => setMenuOpen(false)}>Capabilities</Link>
          <Link href="#about" onClick={() => setMenuOpen(false)}>About</Link>
        </nav>
        <button className="header-cta" type="button" onClick={openInquiry}>Start an RFQ</button>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">RF CONTROL SOLUTIONS · BUILT TO SPEC</p>
            <h1>Wireless control,<br />engineered to fit.</h1>
            <p className="hero-description">RF remote controls, receivers and modules for access control, motors, lighting and smart devices.</p>
            <div className="hero-actions">
              <button className="primary-button" type="button" onClick={openInquiry}>Request a custom solution</button>
              <Link className="text-link" href="/products">Explore products</Link>
            </div>
            <p className="hero-note">Tell us your voltage, range and channel requirements. We reply within 2 hours.</p>
          </div>
          <div className="hero-visual">
            <div className="product-stage">
              <img className="hero-main-product" src="/assets/67d6ba3c0e8ef810.jpg" alt="Industrial RF remote control range" />
              <div className="spec-label spec-one"><span>FREQUENCY</span>433.92 MHz</div>
              <div className="spec-label spec-two"><span>CONTROL</span>4 channels</div>
              <div className="spec-label spec-three"><span>RANGE</span>Up to 2000 m</div>
            </div>
          </div>
        </section>

        <section className="proof-strip" aria-label="Company strengths">
          <div><strong>15 years</strong><span>R&amp;D experience</span></div>
          <div><strong>≤ 2h</strong><span>Average response</span></div>
          <div><strong>OEM</strong><span>Logo &amp; packaging</span></div>
          <div><strong>Global</strong><span>FBA shipping support</span></div>
        </section>

        <section className="section products-section" id="products">
          <div className="section-heading">
            <div><p className="eyebrow">PRODUCT SYSTEM</p><h2>The right signal starts with the right hardware.</h2></div>
            <p>A focused range of transmitters, receivers and modules—configured around your product instead of forcing your product to adapt.</p>
          </div>
          <div className="product-grid">
            {families.map((product, index) => (
              <button className={activeProduct === index ? "product-card active" : "product-card"} key={`${product.name}-${index}`} type="button" onClick={() => setActiveProduct(index)}>
                <span className="product-index">0{index + 1}</span>
                <span className="product-image-wrap"><img src={product.image} alt="" /></span>
                <strong>{product.name}</strong>
                <span className="product-description">{product.description}</span>
                <span className="product-specs">{product.specs}</span>
              </button>
            ))}
          </div>
          <div className="selected-product">
            <div><span>Selected family</span><strong>{families[activeProduct].name}</strong></div>
            <p>{families[activeProduct].description}</p>
            <Link href={`/products/${families[activeProduct].slug}`}>View product</Link>
          </div>
        </section>

        <section className="applications" id="applications">
          <div className="applications-intro">
            <p className="eyebrow light">APPLICATION-LED ENGINEERING</p>
            <h2>Built for the real conditions behind every button press.</h2>
            <p>Share the device, environment and control logic. We match the transmitter, receiver and coding method around the application.</p>
            <button className="signal-button" type="button" onClick={openInquiry}>Discuss your application</button>
          </div>
          <div className="application-list">
            {applications.map(([title, detail], index) => <div className="application-row" key={title}><span>0{index + 1}</span><strong>{title}</strong><p>{detail}</p></div>)}
          </div>
        </section>

        <section className="section capability-section" id="capabilities">
          <div className="section-heading">
            <div><p className="eyebrow">ENGINEERING &amp; CUSTOMIZATION</p><h2>From an initial requirement to a repeatable product.</h2></div>
            <p>Our team supports specification matching, samples, private labeling and production coordination for global buyers.</p>
          </div>
          <div className="capability-layout">
            <div className="capability-image"><img src="/assets/c5f89f065108be6f.jpg" alt="Long-distance RF remote control product" /></div>
            <div className="capability-list">
              <div><span>01</span><strong>Frequency &amp; coding</strong><p>315 MHz, 433.92 MHz, 868 MHz, learning and rolling code options.</p></div>
              <div><span>02</span><strong>Electrical specification</strong><p>Match voltage, relay load, channels, standby power and control mode.</p></div>
              <div><span>03</span><strong>Brand customization</strong><p>Logo printing, enclosure color, labels, manuals and retail packaging.</p></div>
              <div><span>04</span><strong>Fulfillment support</strong><p>Flexible MOQ, repeat-order consistency and direct shipping to FBA.</p></div>
            </div>
          </div>
        </section>

        <section className="about-section" id="about">
          <div><p className="eyebrow light">ANQING · CHINA</p><h2>A responsive RF control partner for teams building real products.</h2></div>
          <div><p>ANRIVERS combines 15 years of RF product experience with a practical, buyer-friendly process. Our products serve customers across North America, Europe, Australia, Japan, South Korea and Africa.</p><button className="light-button" type="button" onClick={openInquiry}>Work with ANRIVERS</button></div>
        </section>
      </main>

      <footer>
        <BrandLogo brand={brand} href="#top" className="footer-brand" theme="dark" />
        <p>RF remote controls, receivers, modules and sensors.</p>
        <p>© 2026 Anqing Rivers Electronic Technology Co., Ltd.</p>
      </footer>

      <InquiryModal open={inquiryOpen} onClose={() => setInquiryOpen(false)} />
    </div>
  );
}
