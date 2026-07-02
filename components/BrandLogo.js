import Link from "next/link";

export function BrandLogo({ brand, href = "/", className = "", ariaLabel, theme = "light" }) {
  return (
    <Link
      className={`brand brand-lockup ${className}`.trim()}
      href={href}
      aria-label={ariaLabel || `${brand.title} ${brand.subtitle}`}
    >
      <img
        className="brand-mark"
        src={theme === "dark" ? "/anrivers-brand-icon-light.png" : "/anrivers-brand-icon.png"}
        alt=""
        width="512"
        height="512"
      />
      <span className="brand-copy">
        <span className="brand-title">{brand.title}</span>
        <span className="brand-subtitle">{brand.subtitle}</span>
      </span>
    </Link>
  );
}
