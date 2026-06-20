# Rivers RF Control Website

Next.js App Router website with PostgreSQL/Prisma product management.

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
