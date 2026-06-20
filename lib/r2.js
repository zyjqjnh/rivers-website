import "server-only";
import { S3Client } from "@aws-sdk/client-s3";

const requiredVariables = [
  "R2_ACCOUNT_ID",
  "R2_ACCESS_KEY_ID",
  "R2_SECRET_ACCESS_KEY",
  "R2_BUCKET_NAME",
  "R2_PUBLIC_URL",
];

export const isR2Configured = requiredVariables.every((name) => Boolean(process.env[name]));

export function getR2Client() {
  if (!isR2Configured) {
    throw new Error(`R2 is not configured. Set ${requiredVariables.join(", ")}.`);
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

export function getR2PublicUrl(key) {
  const baseUrl = process.env.R2_PUBLIC_URL.replace(/\/+$/, "");
  return `${baseUrl}/${key.split("/").map(encodeURIComponent).join("/")}`;
}
