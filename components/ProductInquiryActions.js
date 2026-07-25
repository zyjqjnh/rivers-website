"use client";

import { useState } from "react";
import { FileText, MessageCircle } from "lucide-react";
import { InquiryModal } from "@/components/InquiryModal";
import { trackEvent } from "@/lib/analytics";

export function ProductInquiryActions({ productName, productUrl, whatsappUrl }) {
  const [quoteOpen, setQuoteOpen] = useState(false);

  const actions = (className, whatsappLabel, ctaLocation) => (
    <div className={className} aria-label="Product contact options">
      {whatsappUrl && (
        <a
          className="whatsapp-button"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("whatsapp_click", { product_name: productName, cta_location: ctaLocation })}
        >
          <MessageCircle />
          {whatsappLabel}
        </a>
      )}
      <button
        className="quote-button"
        type="button"
        onClick={() => {
          trackEvent("rfq_start", { product_name: productName, cta_location: ctaLocation });
          setQuoteOpen(true);
        }}
      >
        <FileText />
        Get a quote
      </button>
    </div>
  );

  return (
    <>
      {actions("product-contact-actions product-contact-actions-inline", "Chat on WhatsApp", "product_inline")}
      {actions("product-contact-sticky", "WhatsApp", "mobile_sticky")}
      <InquiryModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        productName={productName}
        productUrl={productUrl}
      />
    </>
  );
}
