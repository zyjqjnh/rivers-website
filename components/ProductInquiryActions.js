"use client";

import { useState } from "react";
import { FileText, MessageCircle } from "lucide-react";
import { InquiryModal } from "@/components/InquiryModal";

export function ProductInquiryActions({ productName, productUrl, whatsappUrl }) {
  const [quoteOpen, setQuoteOpen] = useState(false);

  const actions = (className, whatsappLabel) => (
    <div className={className} aria-label="Product contact options">
      {whatsappUrl && (
        <a className="whatsapp-button" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <MessageCircle />
          {whatsappLabel}
        </a>
      )}
      <button className="quote-button" type="button" onClick={() => setQuoteOpen(true)}>
        <FileText />
        Get a quote
      </button>
    </div>
  );

  return (
    <>
      {actions("product-contact-actions product-contact-actions-inline", "Chat on WhatsApp")}
      {actions("product-contact-sticky", "WhatsApp")}
      <InquiryModal
        open={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        productName={productName}
        productUrl={productUrl}
      />
    </>
  );
}
