export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;
export const VIDEO_CONTENT_TYPE = "video/mp4";
export const VIDEO_CACHE_CONTROL = "public, max-age=31536000, immutable";

export function getVideoUploadError(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) return "Invalid upload request.";
  if (typeof input.filename !== "string" || !/\.mp4$/i.test(input.filename) || input.contentType !== VIDEO_CONTENT_TYPE) {
    return "Choose an MP4 video file.";
  }
  if (!Number.isSafeInteger(input.size) || input.size <= 0 || input.size > MAX_VIDEO_SIZE) {
    return "Each video must be non-empty and 100 MB or smaller.";
  }
  return null;
}
