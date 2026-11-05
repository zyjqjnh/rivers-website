import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

const credentialVariables = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
];

const hasCredentials = credentialVariables.every((name) => Boolean(process.env[name]));
export const isR2Configured = hasCredentials && Boolean(process.env.R2_BUCKET_NAME && process.env.R2_PUBLIC_URL);
export const isR2VideoConfigured = hasCredentials && Boolean(process.env.R2_VIDEO_BUCKET_NAME && process.env.R2_VIDEO_PUBLIC_URL);

export function getR2Client() {
  if (!hasCredentials) {
    throw new Error(`R2 is not configured. Set ${credentialVariables.join(", ")}.`);
  }

  return new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
}

export function getR2PublicUrl(key, publicUrl = process.env.R2_PUBLIC_URL) {
  const baseUrl = publicUrl.replace(/\/+$/, "");
  return `${baseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
