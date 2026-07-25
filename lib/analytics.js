"use client";

export function trackEvent(name, parameters = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;

  const cleanParameters = Object.fromEntries(
    Object.entries(parameters).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );

  window.gtag("event", name, cleanParameters);
}
