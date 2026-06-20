"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ProductImageGallery({ images, productName }) {
  const galleryImages = images.length ? images : [{ url: "/assets/67d6ba3c0e8ef810.jpg", alt: productName }];
  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultipleImages = galleryImages.length > 1;
  const activeImage = galleryImages[activeIndex];

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
        <div className="gallery-thumbnails" aria-label="Product images">
          {galleryImages.map((image, index) => (
            <button
              className={`gallery-thumbnail${index === activeIndex ? " active" : ""}`}
              type="button"
              key={`${image.url}-${index}`}
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
