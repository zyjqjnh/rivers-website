"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

// Render the frame directly in a paused video element. This also works for
// external video hosts that do not allow canvas-based frame extraction (CORS).
export function ProductVideoThumbnail({ url }) {
  const [hasFrame, setHasFrame] = useState(false);
  const videoRef = useRef(null);
  useEffect(() => {
    // Cached media may finish loading before React attaches event handlers.
    const video = videoRef.current;
    setHasFrame(Boolean(video && video.readyState >= 2 && !video.error));
  }, [url]);
  const previewUrl = new URL(url);
  previewUrl.hash = "t=0.001";

  return (
    <span className={`gallery-video-thumbnail${hasFrame ? " has-frame" : ""}`}>
      <video
        ref={videoRef}
        src={previewUrl.href}
        muted
        playsInline
        preload="metadata"
        tabIndex={-1}
        aria-hidden="true"
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          // Seeking requests just the opening frame without starting playback.
          if (Number.isFinite(video.duration) && video.duration > 0) {
            video.currentTime = Math.min(0.001, video.duration / 2);
          }
        }}
        onLoadedData={() => setHasFrame(true)}
        onSeeked={(event) => setHasFrame(event.currentTarget.readyState >= 2)}
        onError={() => setHasFrame(false)}
      />
      <span className="gallery-video-play"><Play aria-hidden="true" /></span>
      <span className="gallery-video-label">Video</span>
    </span>
  );
}
