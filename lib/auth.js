import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "rivers_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12;

function getSessionSecret() {
  const secret = process.env.AUTH_SECRET;
  return secret?.trim() || null;
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

function parseSession(value) {
  const secret = getSessionSecret();
  if (!secret || !value) return null;

  const separator = value.lastIndexOf(".");
  if (separator === -1) return null;
  const encodedPayload = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expectedSignature = sign(encodedPayload, secret);
  if (signature.length !== expectedSignature.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    if (!payload?.sub || !payload?.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const store = await cookies();
  const payload = parseSession(store.get(COOKIE_NAME)?.value);
  if (!payload) return null;

  try {
    return await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, name: true, role: true },
    });
  } catch {
    return null;
  }
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}

export async function createAdminSession(user) {
  const secret = getSessionSecret();
  if (!secret) throw new Error("AUTH_SECRET is required.");

  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS;
  const encodedPayload = Buffer.from(JSON.stringify({
    sub: user.id,
    exp: expiresAt,
  })).toString("base64url");
  const token = `${encodedPayload}.${sign(encodedPayload, secret)}`;
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
