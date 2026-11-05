"use client";

import { useEffect, useRef, useState } from "react";
import { ProductVideoThumbnail } from "@/components/ProductVideoThumbnail";
import { ProductVideo } from "@/components/ProductVideo";
import { isProductVideoUrl } from "@/lib/product-video";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

export function ProductImageGallery({ images, videoUrl, productName }) {
  const hasVideo = isProductVideoUrl(videoUrl);
  const galleryImages = images.length ? images : hasVideo ? [] : [{ url: "/assets/67d6ba3c0e8ef810.jpg", alt: productName }];
  const mediaItems = [
    ...galleryImages.map((image) => ({ ...image, type: "image" })),
    ...(hasVideo ? [{ url: videoUrl, type: "video" }] : []),
  ];
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbnailStripRef = useRef(null);
  const thumbnailRefs = useRef([]);
  const lightboxRef = useRef(null);
  const lightboxCloseRef = useRef(null);
  const imageTriggerRef = useRef(null);
  const touchStartXRef = useRef(null);
  const hasMultipleMedia = mediaItems.length > 1;
  const activeImage = mediaItems[activeIndex] || mediaItems[0];

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
      } else if (event.key === "ArrowLeft" && galleryImages.length > 1) {
        event.preventDefault();
        selectPrevious();
      } else if (event.key === "ArrowRight" && galleryImages.length > 1) {
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
  }, [isLightboxOpen, hasMultipleMedia, galleryImages.length]);

  function selectPrevious() {
    const count = isLightboxOpen ? galleryImages.length : mediaItems.length;
    setActiveIndex((index) => (index - 1 + count) % count);
  }

  function selectNext() {
    const count = isLightboxOpen ? galleryImages.length : mediaItems.length;
    setActiveIndex((index) => (index + 1) % count);
  }

  function handleKeyDown(event) {
    if (!hasMultipleMedia || isLightboxOpen || event.target.tagName === "VIDEO") return;
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
    if (!hasMultipleMedia || touchStartXRef.current === null) return;
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
      <div className={`product-detail-image${activeImage.type === "video" ? " product-detail-video" : ""}`}>
        {activeImage.type === "video" ? (
          <ProductVideo url={activeImage.url} productName={productName} />
        ) : (
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
        )}

        {hasMultipleMedia && (
          <>
            <button className="gallery-arrow gallery-arrow-previous" type="button" onClick={selectPrevious} aria-label="Previous product media"><ChevronLeft /></button>
            <button className="gallery-arrow gallery-arrow-next" type="button" onClick={selectNext} aria-label="Next product media"><ChevronRight /></button>
            <span className="gallery-count" aria-live="polite">{activeIndex + 1} / {mediaItems.length}</span>
          </>
        )}
      </div>

      {hasMultipleMedia && (
        <div className="gallery-thumbnails" ref={thumbnailStripRef} aria-label="Product images and video">
          {mediaItems.map((image, index) => (
            <button
              className={`gallery-thumbnail${index === activeIndex ? " active" : ""}`}
              type="button"
              key={`${image.url}-${index}`}
              ref={(element) => {
                thumbnailRefs.current[index] = element;
              }}
              onClick={() => setActiveIndex(index)}
              aria-label={image.type === "video" ? "Show product video" : `Show product image ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {image.type === "video" ? (
                <ProductVideoThumbnail url={image.url} />
              ) : <img src={image.url} alt="" />}
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

            {galleryImages.length > 1 && (
              <>
                <button className="gallery-lightbox-arrow gallery-lightbox-previous" type="button" onClick={selectPrevious} aria-label="Previous product image"><ChevronLeft /></button>
                <button className="gallery-lightbox-arrow gallery-lightbox-next" type="button" onClick={selectNext} aria-label="Next product image"><ChevronRight /></button>
              </>
            )}
          </div>

          {galleryImages.length > 1 && <span className="gallery-lightbox-count" aria-live="polite">{activeIndex + 1} / {galleryImages.length}</span>}
        </div>
      )}
    </div>
  );
}
