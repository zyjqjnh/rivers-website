"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductImageGallery({ images, productName }) {
  const galleryImages = images.length ? images : [{ url: "/assets/67d6ba3c0e8ef810.jpg", alt: productName }];
  const [activeIndex, setActiveIndex] = useState(0);
  const thumbnailStripRef = useRef(null);
  const thumbnailRefs = useRef([]);
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

  function selectPrevious() {
    setActiveIndex((index) => (index - 1 + galleryImages.length) % galleryImages.length);
  }

  function selectNext() {
    setActiveIndex((index) => (index + 1) % galleryImages.length);
  }

  function handleKeyDown(event) {
    if (!hasMultipleImages) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectPrevious();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      selectNext();
    }
  }

  return (
    <div className="product-gallery" onKeyDown={handleKeyDown}>
      <div className="product-detail-image">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={activeImage.url} alt={activeImage.alt || productName} />

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
    </div>
  );
}
