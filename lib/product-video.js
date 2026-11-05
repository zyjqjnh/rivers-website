// Shared by saving and rendering so unsupported URL schemes never reach a player.
export function isProductVideoUrl(value) {
  if (typeof value !== "string" || !value.trim() || value.length > 4096) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && Boolean(url.hostname) && !url.username && !url.password;
  } catch {
    return false;
  }
}
