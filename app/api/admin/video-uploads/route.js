import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { getR2Client, getR2PublicUrl, isR2VideoConfigured } from "@/lib/r2";
import { getVideoUploadError, VIDEO_CONTENT_TYPE, VIDEO_CACHE_CONTROL } from "@/lib/product-video-upload";

export async function POST(request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  }
  if (!isR2VideoConfigured) {
    return NextResponse.json({ error: "Video storage has not been configured." }, { status: 503 });
  }

  let input;
  try {
    input = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid upload request." }, { status: 400 });
  }
  const error = getVideoUploadError(input);
  if (error) return NextResponse.json({ error }, { status: 400 });

  try {
    const now = new Date();
    const datePath = `${now.getUTCFullYear()}/${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
    const key = `product-videos/${datePath}/${randomUUID()}.mp4`;
    const command = new PutObjectCommand({
      Bucket: process.env.R2_VIDEO_BUCKET_NAME,
      Key: key,
      ContentType: VIDEO_CONTENT_TYPE,
      ContentLength: input.size,
      CacheControl: VIDEO_CACHE_CONTROL,
    });
    const uploadUrl = await getSignedUrl(getR2Client(), command, {
      expiresIn: 300,
      signableHeaders: new Set(["content-type", "cache-control"]),
    });
    return NextResponse.json({
      uploadUrl,
      publicUrl: getR2PublicUrl(key, process.env.R2_VIDEO_PUBLIC_URL),
      headers: { "Content-Type": VIDEO_CONTENT_TYPE, "Cache-Control": VIDEO_CACHE_CONTROL },
    }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Unable to prepare the video upload. Please try again." }, { status: 500 });
  }
}
