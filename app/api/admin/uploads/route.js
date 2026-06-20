import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getR2Client, getR2PublicUrl, isR2Configured } from "@/lib/r2";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]);
const EXTENSIONS = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function POST(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }

  if (!isR2Configured) {
    return NextResponse.json({ error: "R2 storage has not been configured." }, { status: 503 });
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }

  const contentType = String(input.contentType || "").toLowerCase();
  const size = Number(input.size);

  if (!ALLOWED_TYPES.has(contentType)) {
    return NextResponse.json({ error: "Use a JPG, PNG, WebP, GIF, or AVIF image." }, { status: 400 });
  }

  if (!Number.isFinite(size) || size <= 0 || size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Each image must be 10 MB or smaller." }, { status: 400 });
  }

  const now = new Date();
  const datePath = [now.getUTCFullYear(), String(now.getUTCMonth() + 1).padStart(2, "0")].join("/");
  const key = `product-images/${datePath}/${randomUUID()}.${EXTENSIONS[contentType]}`;
  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
    ContentLength: size,
  });
  const uploadUrl = await getSignedUrl(getR2Client(), command, { expiresIn: 300 });

  return NextResponse.json({
    uploadUrl,
    publicUrl: getR2PublicUrl(key),
  });
}
