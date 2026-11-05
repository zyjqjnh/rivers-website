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
        preload="none"
        aria-label={`${productName} product video`}
        onError={() => setFailedUrl(url)}
      >
        Your browser does not support embedded video.
      </video>
      <p className="product-video-help" role={failedUrl === url ? "status" : undefined}>
        {failedUrl === url ? "This video could not be played. " : ""}
        <a href={url} target="_blank" rel="noopener noreferrer">Open video in a new tab</a>
      </p>
    </section>
  );
}
