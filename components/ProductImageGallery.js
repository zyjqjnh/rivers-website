"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

export function ProductImageGallery({ images, productName }) {
  const galleryImages = images.length ? images : [{ url: "/assets/67d6ba3c0e8ef810.jpg", alt: productName }];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbnailStripRef = useRef(null);
  const thumbnailRefs = useRef([]);
  const lightboxRef = useRef(null);
  const lightboxCloseRef = useRef(null);
  const imageTriggerRef = useRef(null);
  const touchStartXRef = useRef(null);
  const hasMultipleImages = galleryImages.length > 1;
  const activeImage = galleryImages[activeIndex];

  useEffect(() => {
    const strip = thumbnailStripRef.current;
    const activeThumbnail = thumbnailRefs.current[activeIndex];
    if (!strip || !activeThumbnail) return;

    const stripBounds = strip.getBoundingClientRect();
    const thumbnailBounds = activeThumbnail.getBoundingClientRect();
    const edgePadding = 8;
    let nextScrollLeft = strip.scrollLeft;

    if (thumbnailBounds.left < stripBounds.left + edgePadding) {
      nextScrollLeft -= stripBounds.left + edgePadding - thumbnailBounds.left;
    } else if (thumbnailBounds.right > stripBounds.right - edgePadding) {
      nextScrollLeft += thumbnailBounds.right - (stripBounds.right - edgePadding);
    } else {
      return;
    }

    strip.scrollTo({ left: nextScrollLeft, behavior: "smooth" });
  }, [activeIndex]);

  useEffect(() => {
    if (!isLightboxOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lightboxCloseRef.current?.focus();

    function handleLightboxKeyDown(event) {
      if (event.key === "Tab") {
        const controls = lightboxRef.current?.querySelectorAll("button:not(:disabled)");
        if (!controls?.length) return;
        const firstControl = controls[0];
        const lastControl = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === firstControl) {
          event.preventDefault();
          lastControl.focus();
        } else if (!event.shiftKey && document.activeElement === lastControl) {
          event.preventDefault();
          firstControl.focus();
        }
      } else if (event.key === "Escape") {
        event.preventDefault();
        setIsLightboxOpen(false);
      } else if (event.key === "ArrowLeft" && hasMultipleImages) {
        event.preventDefault();
        selectPrevious();
      } else if (event.key === "ArrowRight" && hasMultipleImages) {
        event.preventDefault();
        selectNext();
      }
    }

    window.addEventListener("keydown", handleLightboxKeyDown);
    return () => {
      window.removeEventListener("keydown", handleLightboxKeyDown);
      document.body.style.overflow = previousOverflow;
      imageTriggerRef.current?.focus();
    };
  }, [isLightboxOpen, hasMultipleImages]);

  function selectPrevious() {
    setActiveIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length);
  }

  function selectNext() {
    setActiveIndex((index) => (index + 1) % galleryImages.length);
  }

  function handleKeyDown(event) {
    if (!hasMultipleImages || isLightboxOpen) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      selectNext();
    }
  }

  function handleTouchStart(event) {
    touchStartXRef.current = event.changedTouches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event) {
    if (!hasMultipleImages || touchStartXRef.current === null) return;
    const touchEndX = event.changedTouches[0]?.clientX;
    if (touchEndX === undefined) return;

    const distance = touchEndX - touchStartXRef.current;
    touchStartXRef.current = null;
    if (Math.abs(distance) < 48) return;
    if (distance > 0) selectPrevious();
    else selectNext();
  }

  return (
    <div className="product-gallery" onKeyDown={handleKeyDown}>
      <div className="product-detail-image">
        <button
          className="gallery-image-trigger"
          type="button"
          ref={imageTriggerRef}
          onClick={() => setIsLightboxOpen(true)}
          aria-label={`Enlarge ${activeImage.alt || productName}`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={activeImage.url} alt={activeImage.alt || productName} />
          <span className="gallery-zoom-hint" aria-hidden="true"><ZoomIn /></span>
        </button>

        {hasMultipleImages && (
          <>
            <button className="gallery-arrow gallery-arrow-previous" type="button" onClick={selectPrevious} aria-label="Previous product image"><ChevronLeft /></button>
            <button className="gallery-arrow gallery-arrow-next" type="button" onClick={selectNext} aria-label="Next product image"><ChevronRight /></button>
            <span className="gallery-count" aria-live="polite">{activeIndex + 1} / {galleryImages.length}</span>
          </>
        )}
      </div>

      {hasMultipleImages && (
        <div className="gallery-thumbnails" ref={thumbnailStripRef} aria-label="Product images">
          {galleryImages.map((image, index) => (
            <button
              className={`gallery-thumbnail${index === activeIndex ? " active" : ""}`}
              type="button"
              key={`${image.url}-${index}`}
              ref={(element) => {
                thumbnailRefs.current[index] = element;
              }}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show product image ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt="" />
            </button>
          ))}
        </div>
      )}

      {isLightboxOpen && (
        <div
          className="gallery-lightbox"
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} enlarged image`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsLightboxOpen(false);
          }}
        >
          <button
            className="gallery-lightbox-close"
            type="button"
            ref={lightboxCloseRef}
            onClick={() => setIsLightboxOpen(false)}
            aria-label="Close enlarged image"
          >
            <X />
          </button>

          <div className="gallery-lightbox-stage" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeImage.url} alt={activeImage.alt || productName} />

            {hasMultipleImages && (
              <>
                <button className="gallery-lightbox-arrow gallery-lightbox-previous" type="button" onClick={selectPrevious} aria-label="Previous product image"><ChevronLeft /></button>
                <button className="gallery-lightbox-arrow gallery-lightbox-next" type="button" onClick={selectNext} aria-label="Next product image"><ChevronRight /></button>
              </>
            )}
          </div>

          {hasMultipleImages && <span className="gallery-lightbox-count" aria-live="polite">{activeIndex + 1} / {galleryImages.length}</span>}
        </div>
      )}
    </div>
  );
}
