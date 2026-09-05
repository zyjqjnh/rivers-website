"use client";

import { useState } from "react";
import { InquiryModal } from "@/components/InquiryModal";
import { trackEvent } from "@/lib/analytics";

export function CategoryQuoteButton({ categoryName, categoryUrl, fields }) {
  const [open, setOpen] = useState(false);
  const initialMessage = `I would like help selecting ${categoryName}.\nCategory: ${categoryUrl}\n\n${fields.map((field) => `${field}:`).join("\n")}`;
  return (
    <>
      <button className="signal-button" type="button" onClick={() => {
        trackEvent("rfq_start", { category_name: categoryName, cta_location: "category_guide" });
        setOpen(true);
      }}>Discuss your requirements <span aria-hidden="true">↗</span></button>
      <InquiryModal open={open} onClose={() => setOpen(false)} initialMessage={initialMessage} />
    </>
  );
}
