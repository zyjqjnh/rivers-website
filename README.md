# Rivers RF Control Website

Next.js App Router website with PostgreSQL/Prisma product management.

Production deployment for `anrivers.com` is documented in [DEPLOYMENT.md](./DEPLOYMENT.md).

## Search engine setup

The app generates `/robots.txt` and `/sitemap.xml`, canonical URLs, and structured data for the organization, catalogue, categories, products, and breadcrumbs.

To verify the site in Google Search Console:

1. Add `https://anrivers.com` as a URL-prefix property.
2. Choose the HTML tag verification method.
3. Copy only the `content` token into `GOOGLE_SITE_VERIFICATION`.
4. Deploy, verify the property, then submit `https://anrivers.com/sitemap.xml`.

## Local setup

The project includes a local PostgreSQL service in `docker-compose.yml`.

Run:

```bash
docker compose up -d postgres
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Set `ADMIN_EMAIL`, `ADMIN_PASSWORD`, and `AUTH_SECRET` before seeding. The seed command creates or updates the initial administrator account; the admin login then uses the stored email and bcrypt password hash.

Stop PostgreSQL without deleting its data:

```bash
docker compose stop postgres
```

Delete the container and local database volume:

```bash
docker compose down -v
```

Open:

- Website: `http://127.0.0.1:3000`
- Products: `http://127.0.0.1:3000/products`
- Admin: `http://127.0.0.1:3000/admin`

Without `DATABASE_URL`, the public catalogue and admin preview use read-only demo data. Product editing becomes active after PostgreSQL is configured and migrated.

## Google Analytics 4

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to the measurement ID from the GA4 web data stream:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID="G-XXXXXXXXXX"
```

The Google tag loads on public pages only after the visitor accepts analytics cookies. Admin routes are excluded. In the GA4 web data stream, keep enhanced measurement enabled so page loads and Next.js browser-history changes are collected automatically.

The site sends these business events without form contents or contact details:

- `rfq_start`
- `generate_lead`
- `whatsapp_click`
- `catalog_click`
- `category_click`
- `product_family_select`
- `view_product_click`

Mark `generate_lead` as a key event in GA4. Register `cta_location`, `product_name`, `category_name`, and `inquiry_type` as event-scoped custom dimensions if they are needed in standard reports.

## Current management foundation

- Product and category schema
- Multiple product images by URL
- Ordered product specifications
- Draft, published and archived states
- Featured products
- SEO fields
- Password-protected admin
- Product create, edit and delete actions
- Inquiry-ready database models

## Cloudflare R2 image uploads

The admin product form supports direct multi-image uploads to Cloudflare R2 using short-lived presigned URLs. Add the five `R2_*` values from `.env.example`, configure the bucket for public reads (preferably through a custom domain), and allow browser `PUT` requests in the bucket CORS policy.

Suggested R2 CORS policy:

```json
[
  {
    "AllowedOrigins": ["http://127.0.0.1:3000", "https://your-production-domain.com"],
    "AllowedMethods": ["GET", "PUT"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

Uploaded public URLs are stored through the existing `ProductImage` model. The manual URL editor remains available for `/assets/...` files or externally hosted images.
