# Deploy anrivers.com to Tencent Cloud

This deployment runs one Next.js container and one private PostgreSQL container. Host Nginx terminates HTTPS and proxies only to `127.0.0.1:3000`. Product images continue to use Cloudflare R2.

## 1. Server and DNS

Recommended server:

- Ubuntu 22.04 or 24.04
- 2 CPU cores and 4 GB RAM
- At least 40 GB system disk

Tencent Cloud security group:

- TCP 22 from your own IP where possible
- TCP 80 from all addresses
- TCP 443 from all addresses
- Do not expose TCP 3000 or 5432

Create DNS A records:

- `anrivers.com` → Tencent Cloud public IP
- `www.anrivers.com` → Tencent Cloud public IP
- Optional `images.anrivers.com` → the Cloudflare R2 custom domain target

If the CVM is in mainland China, complete ICP filing before serving the production domain.

## 2. Install server packages

Install Docker Engine and the Compose plugin using Docker's official Ubuntu instructions. Then install the host reverse proxy and certificate client:

```bash
sudo apt update
sudo apt install -y nginx certbot
sudo systemctl enable --now nginx docker
```

Add your deployment user to the Docker group, then reconnect:

```bash
sudo usermod -aG docker "$USER"
```

## 3. Clone the repository

```bash
sudo mkdir -p /opt/rivers-website
sudo chown "$USER":"$USER" /opt/rivers-website
git clone YOUR_GIT_REPOSITORY /opt/rivers-website
cd /opt/rivers-website
```

## 4. Create production secrets

```bash
cp .env.production.example .env.production
chmod 600 .env.production
```

Generate safe values:

```bash
openssl rand -hex 32
openssl rand -hex 64
```

Edit `.env.production`:

- Use the first value for `POSTGRES_PASSWORD`.
- Put the same database password in `DATABASE_URL`.
- Use the second value for `AUTH_SECRET`.
- Set `ADMIN_EMAIL` and a separate strong `ADMIN_PASSWORD`.
- Fill all `R2_*` values if admin image uploads should be enabled.

Use a URL-safe database password such as hexadecimal text. This avoids needing to percent-encode special characters inside `DATABASE_URL`.

## 5. First deployment

The `--seed` flag creates or updates the initial administrator and loads the starter catalogue. Use it for the first production deployment only:

```bash
chmod +x deploy/scripts/*.sh
./deploy/scripts/deploy.sh --seed
```

Verify locally on the server:

```bash
curl http://127.0.0.1:3000/api/health
docker compose --env-file .env.production -f compose.production.yml ps
```

Expected health response:

```json
{"status":"ok","database":true}
```

## 6. Enable Nginx and HTTPS

Install the temporary HTTP configuration:

```bash
sudo ./deploy/scripts/install-nginx-config.sh http
```

Confirm both domain names resolve to the server, then issue the certificate:

```bash
sudo ./deploy/scripts/issue-certificate.sh YOUR_EMAIL_ADDRESS
```

The script installs the final HTTPS configuration, redirects `www.anrivers.com` to `anrivers.com`, enables HSTS, adds security headers, and rate-limits the administrator login endpoint.

## 7. Configure Cloudflare R2

Use `deploy/r2-cors.json` as the bucket CORS policy. Set the R2 public custom domain to `images.anrivers.com` if desired, then set:

```env
R2_PUBLIC_URL="https://images.anrivers.com"
```

Redeploy after changing production environment variables:

```bash
./deploy/scripts/deploy.sh
```

## 8. Routine updates

The update script creates a database backup, pulls Git with fast-forward only, applies Prisma migrations, rebuilds, and restarts the app:

```bash
cd /opt/rivers-website
./deploy/scripts/update.sh
```

Do not run the seed command during routine deployments because it replaces the starter product content.

## 9. Database backups

Create a backup:

```bash
./deploy/scripts/backup-db.sh
```

Backups are written to the ignored `backups/` directory with mode `600`. Copy them to another machine or an encrypted object-storage bucket; a backup stored only on the same server is not disaster recovery.

Example daily cron entry at 03:20:

```cron
20 3 * * * cd /opt/rivers-website && ./deploy/scripts/backup-db.sh >> /var/log/rivers-backup.log 2>&1
```

Restore only after taking a fresh backup and stopping user traffic:

```bash
CONFIRM_RESTORE=anrivers.com ./deploy/scripts/restore-db.sh backups/rivers-YYYYMMDDTHHMMSSZ.sql.gz
```

## 10. Useful operations

```bash
# Application and database status
docker compose --env-file .env.production -f compose.production.yml ps

# Follow application logs
docker compose --env-file .env.production -f compose.production.yml logs -f app

# Restart the application
docker compose --env-file .env.production -f compose.production.yml restart app

# Apply migrations manually
docker compose --env-file .env.production -f compose.production.yml run --rm migrate

# Validate Nginx
sudo nginx -t

# Test certificate renewal
sudo certbot renew --dry-run
```

## 11. Production URLs

- Website: `https://anrivers.com`
- Products: `https://anrivers.com/products`
- Admin: `https://anrivers.com/admin`
- Health check: `https://anrivers.com/api/health`
