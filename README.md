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
- `alibaba_click`
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

## Cloudflare R2 product videos

The product create, edit, and import review forms accept one MP4 video up to 100 MB. Uploads go directly from the browser to R2, with progress, cancellation, and retry. The URL changes only after a successful upload; save the product to persist it in the existing `Product.videoUrl` field. Manual HTTPS video links remain supported. Clearing or replacing a link does not delete an R2 object. Existing product links are not migrated automatically.

### Configure the video bucket

1. Use the existing Standard storage bucket `anrivers-videos`. Give the shared `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` credentials **Object Read & Write** access to both the image bucket and `anrivers-videos`. Keep credentials on the server. A key restricted to the image bucket cannot upload videos.
2. Following the current image delivery approach, enable **Public Development URL** in R2 → `anrivers-videos` → Settings. This bucket's enabled URL is `https://pub-b7692b0a50134c66be5faf32a42f898f.r2.dev`. Custom-domain binding and DNS changes are deferred by the owner's decision. Cloudflare rate-limits `r2.dev` and does not provide edge caching on it.
3. Apply `deploy/r2-video-cors.json` to the video bucket's CORS policy. It includes the production domains and local preview on port 3000; add the exact preview origin when testing on a different port. Keep the image bucket's existing policy unchanged.
4. Set the following in `.env.local` for development and `.env.production` on the Tencent server, alongside the shared R2 credentials:

   ```dotenv
   R2_VIDEO_BUCKET_NAME="anrivers-videos"
   R2_VIDEO_PUBLIC_URL="https://pub-b7692b0a50134c66be5faf32a42f898f.r2.dev"
   ```

5. Deploy using the existing `deploy/scripts/deploy.sh` / `deploy/scripts/update.sh` workflow. Production Compose already loads `.env.production`; these values do not require Docker build arguments. Restart a development server after changing its environment.

The authenticated `POST /api/admin/video-uploads` endpoint accepts `{ filename, contentType: "video/mp4", size }` and returns `{ uploadUrl, publicUrl, headers }`. The client PUTs the file with the returned headers before the five-minute signature expires. The signed request includes the content length and MIME type. Object keys use `product-videos/YYYY/MM/UUID.mp4`, and uploaded objects have `Content-Type: video/mp4` and `Cache-Control: public, max-age=31536000, immutable`. Each replacement gets a new URL. Do not rewrite or compress the video response body.

If the owner later requests `video.anrivers.com`, first add the domain's zone to the same Cloudflare account and review existing DNS records. Connect the hostname through R2 → Custom Domains and wait for **Active** and valid HTTPS; changing a DNS record to point at the website server is insufficient. Then update `R2_VIDEO_PUBLIC_URL`. Existing saved product URLs remain unchanged until explicitly updated. A Cache Rule can enable edge caching for `video.anrivers.com/product-videos/*` while respecting origin Cache-Control; `r2.dev` cannot use these rules.

Video traffic goes directly to R2 rather than through Next.js or Nginx. No increase to Nginx's upload body limit is needed. R2 does not transcode files: prepare browser-compatible H.264 video / AAC audio in MP4, preferably with Fast Start, before uploading. This version does not support multipart resumable uploads or automatic object deletion.

### Verify before production use

- Run `npm run test:video` and `npm run build`. Test a real MP4 using the visible upload button, save a draft product, reopen it, and confirm the public URL persists. Test cancellation and failure without losing the previous link, then retry and save. Confirm image uploads still work.
- On the public product gallery, verify playback, seeking, opening-frame thumbnail, switching away pauses playback, and mobile inline controls. Confirm the image-only lightbox still works. Test Safari/iOS and Chromium where available.
- Inspect the uploaded object and a Range response using the actual public URL:

  ```bash
  curl -I 'https://pub-b7692b0a50134c66be5faf32a42f898f.r2.dev/product-videos/YYYY/MM/UUID.mp4'
  curl --fail --silent --show-error \
    -H 'Origin: https://anrivers.com' \
    -H 'Range: bytes=0-1048575' \
    -H 'Accept-Encoding: identity' \
    -D /tmp/anrivers-video-headers.txt \
    -o /tmp/anrivers-video-part.bin \
    'https://pub-b7692b0a50134c66be5faf32a42f898f.r2.dev/product-videos/YYYY/MM/UUID.mp4'
  wc -c /tmp/anrivers-video-part.bin
  ```

  Confirm HTTPS, `video/mp4`, browser cache headers, and `206 Partial Content`; the downloaded byte count must match `Content-Length` and the inclusive interval in `Content-Range` (small files may return a shorter interval). Confirm no `ERR_CONTENT_LENGTH_MISMATCH` during seek and playback. Test edge caching only after configuring a custom domain.

If an upload fails with 403, check bucket-scoped credentials and generate a fresh upload URL. Browser network errors may also indicate a missing CORS origin or header. If uploading works but the video is unavailable, check that Public Development URL is enabled (or the custom-domain binding is Active if one is configured). Repeated media decode errors with a reachable URL usually require preparing a compatible MP4 rather than changing the URL.
