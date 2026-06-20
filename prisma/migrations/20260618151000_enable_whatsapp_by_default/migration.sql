ALTER TABLE "SiteSettings" ALTER COLUMN "whatsappEnabled" SET DEFAULT true;

INSERT INTO "SiteSettings" (
    "id",
    "whatsappEnabled",
    "whatsappNumber",
    "whatsappMessageTemplate",
    "createdAt",
    "updatedAt"
)
VALUES (
    'site',
    true,
    '',
    'Hello, I am interested in {product}. Please send me more information.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
