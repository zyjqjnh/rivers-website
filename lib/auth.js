import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "rivers_admin_session";

function getSessionToken() {
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!password || !secret) return null;
  return crypto.createHmac("sha256", secret).update(password).digest("hex");
}

export async function isAdminAuthenticated() {
  const token = getSessionToken();
  if (!token) return false;
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  if (!value || value.length !== token.length) return false;
  return crypto.timingSafeEqual(Buffer.from(value), Buffer.from(token));
}

export async function createAdminSession() {
  const token = getSessionToken();
  if (!token) throw new Error("ADMIN_PASSWORD and AUTH_SECRET are required.");
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
