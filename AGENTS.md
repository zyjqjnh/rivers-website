# Prototype Instructions

Run the local server yourself and open the preview in the in-app browser. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Durable prototype decisions

- Use Cloudflare R2 for admin-uploaded product files. Upload directly from the browser with short-lived presigned URLs, and store the resulting public URLs in the existing `ProductImage` records.
- Product detail pages should show multiple product images as an interactive gallery with arrows, thumbnails, and an image count. Hide carousel controls when a product has only one image.
- Product detail contact calls-to-action should open WhatsApp with a product-specific prefilled message. Manage the shared WhatsApp number, message template, and enabled state from a dedicated admin settings page.
- The main “Products” navigation item should open the full product catalogue when clicked and expose a dropdown of current product categories. Category links should open the catalogue filtered to that category.
- Admin category management should support creating, editing, listing, and deleting categories. A category must never be deleted while products still reference it; enforce this in the UI and again in the server action.
- Public RFQ submissions must be persisted as `Inquiry` records. The admin should have an Inquiries module with a chronological list and a detail view for the submitted contact and technical requirements.
- Product `Full description` content should use a Tiptap rich-text editor. Support headings, inline formatting, lists, links, and public image URLs (including Cloudflare R2 URLs), and render saved HTML safely on product detail pages while preserving legacy plain-text descriptions.
- Admin authentication should use database-backed user accounts with email and bcrypt-hashed passwords. Keep signed, HTTP-only 12-hour sessions; use environment credentials only to seed the initial administrator account.
- Production deployment targets `anrivers.com` on a Tencent Cloud Ubuntu server. Use Docker Compose for the standalone Next.js app and private PostgreSQL service, host Nginx for HTTPS reverse proxying, Cloudflare R2 for product files, and the repository deployment/backup scripts for operations.
