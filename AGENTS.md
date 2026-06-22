# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Durable prototype decisions

- Use Cloudflare R2 for admin-uploaded product files. Upload directly from the browser with short-lived presigned URLs, and store the resulting public URLs in the existing `ProductImage` records.
- Product detail pages should show multiple product images as an interactive gallery with arrows, thumbnails, and an image count. Hide carousel controls when a product has only one image.
- Product detail gallery thumbnails should remain on one horizontal row and scroll sideways when there are more images than fit; do not wrap thumbnails onto additional rows.
- When the active product image changes, automatically scroll the thumbnail strip just enough to keep the selected thumbnail visible, moving backward or forward as needed.
- Keep long product detail titles compact in medium-width two-column layouts so they do not wrap into an excessively tall block; allow a larger title again when the page switches to a single-column layout.
- Balance long product detail pages with two content tiers: keep the gallery and product summary in the top two-column section, then place the full description and specifications in a second two-column section below so neither side is left largely empty.
- Make the lower product-detail description more prominent than supporting copy, using slightly larger and darker body text while keeping comfortable line spacing.
- Give the product-detail WhatsApp call-to-action clear vertical separation from the summary text above it.
- Product detail contact calls-to-action should open WhatsApp with a product-specific prefilled message. Manage the shared WhatsApp number, message template, and enabled state from a dedicated admin settings page.
- The main “Products” navigation item should open the full product catalogue when clicked and expose a dropdown of current product categories. Category links should open the catalogue filtered to that category.
- Admin category management should support creating, editing, listing, and deleting categories. A category must never be deleted while products still reference it; enforce this in the UI and again in the server action.
- Public RFQ submissions must be persisted as `Inquiry` records. The admin should have an Inquiries module with a chronological list and a detail view for the submitted contact and technical requirements.
- Product `Full description` content should use a Tiptap rich-text editor. Support headings, inline formatting, lists, links, and public image URLs (including Cloudflare R2 URLs), and render saved HTML safely on product detail pages while preserving legacy plain-text descriptions.
- Admin authentication should use database-backed user accounts with email and bcrypt-hashed passwords. Keep signed, HTTP-only 12-hour sessions; use environment credentials only to seed the initial administrator account.
- Production deployment targets `anrivers.com` on a Tencent Cloud Ubuntu server. Use Docker Compose for the standalone Next.js app and private PostgreSQL service, host Nginx for HTTPS reverse proxying, Cloudflare R2 for product files, and the repository deployment/backup scripts for operations.
- Public product category pages use `/products/category/[slug]`. Legacy `/products?category=[slug]` requests should redirect to the corresponding category page so each category has one canonical, indexable URL.
- Keep public SEO infrastructure database-aware: generate sitemap entries for published products and current categories at request time, disallow admin routes in robots.txt, mark admin pages `noindex`, and expose Google Search Console verification through an environment variable.
- Admin product management should include an Alibaba.com import workflow: paste a public product URL, extract and rule-clean available product content, copy imported images to Cloudflare R2 when configured, preview and edit the result, and create it as a draft only after explicit confirmation. The first version must not depend on AI.
- The public website brand title and subtitle shown in headers and the footer must be editable from a dedicated admin site settings page.
