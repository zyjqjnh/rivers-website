"use client";

import { useEffect, useRef, useState } from "react";
import { isProductVideoUrl } from "@/lib/product-video";

export function ProductVideo({ url, productName }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const videoRef = useRef(null);
  useEffect(() => {
    const video = videoRef.current;
    return () => video?.pause();
  }, [url]);
  if (!isProductVideoUrl(url)) return null;

  return (
    <section className="product-video" aria-label={`${productName} video`}>
      <video
        ref={videoRef}
        key={url}
        src={url}
        controls
        playsInline
        preload="metadata"
        aria-label={`${productName} product video`}
        onError={() => setFailedUrl(url)}
      >
        Your browser does not support embedded video.
      </video>
      {failedUrl === url && (
        <p className="product-video-help" role="status">
          This video could not be played.
        </p>
      )}
    </section>
  );
}
