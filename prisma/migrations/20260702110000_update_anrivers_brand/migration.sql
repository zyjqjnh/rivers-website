ALTER TABLE "SiteSettings"
ALTER COLUMN "brandTitle" SET DEFAULT 'ANRIVERS';

UPDATE "SiteSettings"
SET "brandTitle" = 'ANRIVERS'
WHERE "brandTitle" = 'RIVERS';
