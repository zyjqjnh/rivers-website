"use client";

import { useActionState, useEffect, useId, useRef } from "react";
import { createInquiryAction } from "@/app/inquiries/actions";

export function InquiryModal({
  open,
  onClose,
  productName = "",
  productUrl = "",
}) {
  const titleId = useId();
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <div className="inquiry-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onMouseDown={(event) => event.stopPropagation()}>
        <button ref={closeButtonRef} className="modal-close" type="button" onClick={onClose}>Close</button>
        <InquiryForm
          onClose={onClose}
          productName={productName}
          productUrl={productUrl}
          titleId={titleId}
        />
      </div>
    </div>
  );
}

function InquiryForm({ onClose, productName, productUrl, titleId }) {
  const [state, action, pending] = useActionState(createInquiryAction, { success: false, message: "" });
  const defaultMessage = productName
    ? `I would like a quote for ${productName}.\nProduct: ${productUrl}\n\nApplication, quantity and other requirements:`
    : "";

  if (state.success) {
    return (
      <div className="success-state">
        <p className="eyebrow">REQUIREMENT RECEIVED</p>
        <h2>Thank you. We’ll review the details and reply shortly.</h2>
        <p>Your requirement has been saved and shared with our team.</p>
        <button className="primary-button" type="button" onClick={onClose}>Back to website</button>
      </div>
    );
  }

  return (
    <>
      <p className="eyebrow">{productName ? "GET A QUOTE" : "START AN RFQ"}</p>
      <h2 id={titleId}>{productName ? "Request pricing for this product." : "Tell us what you need to control."}</h2>
      <p className="modal-intro">
        {productName
          ? `Send your requirements for ${productName} and we’ll reply with the right configuration and pricing.`
          : "A few practical details help our engineers recommend the right setup."}
      </p>
      <form action={action}>
        <label>Work email<input name="email" type="email" placeholder="name@company.com" required /></label>
        <div className="form-row"><label>Voltage<input name="voltage" type="text" placeholder="e.g. DC 12V" required /></label><label>Control range<input name="range" type="text" placeholder="e.g. 500m" /></label></div>
        <label>Application and requirements<textarea name="message" defaultValue={defaultMessage} placeholder="Tell us the device, number of channels, control mode and expected quantity." required /></label>
        {state.message && <p className="inquiry-error" role="alert">{state.message}</p>}
        <button className="primary-button form-submit" type="submit" disabled={pending}>{pending ? "Submitting..." : productName ? "Request quote" : "Submit requirement"}</button>
      </form>
    </>
  );
}
