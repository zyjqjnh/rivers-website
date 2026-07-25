"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const CONSENT_KEY = "anrivers-analytics-consent";
const VALID_MEASUREMENT_ID = /^G-[A-Z0-9]+$/;

export function GoogleAnalytics({ measurementId }) {
  const pathname = usePathname();
  const [consent, setConsent] = useState(undefined);
  const [showChoices, setShowChoices] = useState(false);
  const normalizedId = measurementId?.trim().toUpperCase() || "";
  const enabled = VALID_MEASUREMENT_ID.test(normalizedId) && !pathname.startsWith("/admin");

  useEffect(() => {
    if (!enabled) return;

    const savedConsent = window.localStorage.getItem(CONSENT_KEY);
    if (savedConsent === "granted" || savedConsent === "denied") {
      setConsent(savedConsent);
      return;
    }

    setConsent(null);
    setShowChoices(true);
  }, [enabled]);

  useEffect(() => {
    if (consent !== "granted") return;

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag() {
      window.dataLayer.push(arguments);
    };

    if (window.anriversGaInitialized !== normalizedId) {
      window.gtag("js", new Date());
      window.gtag("config", normalizedId);
      window.anriversGaInitialized = normalizedId;
    }
  }, [consent, normalizedId]);

  if (!enabled) return null;

  const saveConsent = (nextConsent) => {
    const changedExistingChoice = consent === "granted" || consent === "denied";
    window.localStorage.setItem(CONSENT_KEY, nextConsent);
    setConsent(nextConsent);
    setShowChoices(false);

    if (changedExistingChoice && consent !== nextConsent) {
      window.location.reload();
    }
  };

  return (
    <>
      {consent === "granted" && (
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${normalizedId}`}
          strategy="afterInteractive"
        />
      )}

      {showChoices && (
        <section className="analytics-consent" aria-label="Analytics preferences">
          <div>
            <strong>Help us improve ANRIVERS</strong>
            <p>
              We use Google Analytics to understand visits, page engagement, and important button clicks.
              We do not send your form details to Google.
            </p>
          </div>
          <div className="analytics-consent-actions">
            <button type="button" className="analytics-consent-reject" onClick={() => saveConsent("denied")}>
              Reject
            </button>
            <button type="button" className="analytics-consent-accept" onClick={() => saveConsent("granted")}>
              Accept analytics
            </button>
          </div>
        </section>
      )}

      {!showChoices && (consent === "granted" || consent === "denied") && (
        <button
          className="analytics-settings"
          type="button"
          onClick={() => setShowChoices(true)}
        >
          Cookie settings
        </button>
      )}
    </>
  );
}
