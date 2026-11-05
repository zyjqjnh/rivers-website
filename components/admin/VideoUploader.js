"use client";

import { useEffect, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isProductVideoUrl } from "@/lib/product-video";
import { getVideoUploadError, VIDEO_CONTENT_TYPE } from "@/lib/product-video-upload";
import { putVideo } from "@/lib/video-upload-client";

export function VideoUploader({ initialUrl = "", storageReady = false, onUploadingChange }) {
  const [url, setUrl] = useState(initialUrl);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [retryAvailable, setRetryAvailable] = useState(false);
  const fileRef = useRef(null);
  const inputRef = useRef(null);
  const controllerRef = useRef(null);
  const onUploadingChangeRef = useRef(onUploadingChange);
  onUploadingChangeRef.current = onUploadingChange;

  useEffect(() => () => {
    controllerRef.current?.abort();
  }, []);

  async function upload(file) {
    if (!file || controllerRef.current) return;
    // Some operating systems omit the MIME type; the .mp4 extension is still required.
    const contentType = file.type || VIDEO_CONTENT_TYPE;
    const validationError = getVideoUploadError({ filename: file.name, contentType, size: file.size });
    setError(validationError || "");
    setMessage("");
    setRetryAvailable(false);
    if (validationError) return;

    const controller = new AbortController();
    controllerRef.current = controller;
    fileRef.current = file;
    setUploading(true);
    onUploadingChangeRef.current?.(true);
    setProgress(0);
    try {
      const response = await fetch("/api/admin/video-uploads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType, size: file.size }),
        signal: controller.signal,
      });
      const signature = await response.json();
      if (!response.ok) throw new Error(signature.error || "Unable to prepare the video upload.");
      await putVideo(signature, file, controller.signal, setProgress);
      if (controller.signal.aborted) throw new DOMException("Upload cancelled", "AbortError");
      setUrl(signature.publicUrl);
      fileRef.current = null;
      setMessage("Video uploaded. Save the product to keep this video link.");
    } catch (uploadError) {
      if (uploadError.name === "AbortError") setMessage("Upload cancelled. Your previous video link is unchanged.");
      else setError(uploadError.message || "Video upload failed. Please retry.");
      setRetryAvailable(true);
    } finally {
      controllerRef.current = null;
      setUploading(false);
      onUploadingChangeRef.current?.(false);
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".mp4,video/mp4"
        className="sr-only"
        aria-label="Choose product MP4 video"
        disabled={!storageReady || uploading}
        onChange={(event) => {
          upload(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <Button type="button" variant="outline" disabled={!storageReady || uploading} onClick={() => inputRef.current?.click()}>
        <UploadCloud aria-hidden="true" /> Upload MP4 video
      </Button>
      <p className="text-xs leading-5 text-muted-foreground">
        {storageReady ? "MP4 up to 100 MB. H.264/AAC with Fast Start recommended." : "Configure R2 video storage to upload. You can still paste a public video link below."}
      </p>
      {uploading && (
        <div className="space-y-2 rounded-md border bg-slate-50 p-3" aria-busy="true">
          <p className="break-all text-sm" role="status">Uploading {fileRef.current?.name}: {progress}%{progress === 100 ? " — finishing upload…" : ""}</p>
          <progress className="h-2 w-full accent-emerald-600" value={progress} max={100} aria-label="Video upload progress" />
          <Button type="button" size="sm" variant="outline" onClick={() => controllerRef.current?.abort()}>Cancel upload</Button>
          <p className="text-xs text-muted-foreground">Wait for the upload to finish before saving the product.</p>
        </div>
      )}
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {message && <p role="status" className="text-sm text-slate-600">{message}</p>}
      {retryAvailable && !uploading && <Button type="button" size="sm" variant="outline" disabled={!storageReady} onClick={() => upload(fileRef.current)}>Retry upload</Button>}
      <label className="block text-sm font-medium" htmlFor="product-video-url">Product video URL (optional)</label>
      <Input
        id="product-video-url" name="videoUrl" type="url" pattern="https://.*" maxLength={4096}
        value={url} readOnly={uploading} placeholder="https://pub-your-video-bucket.r2.dev/product-videos/demo.mp4"
        onChange={(event) => { setUrl(event.target.value); setMessage(""); }}
      />
      <p className="text-xs leading-5 text-muted-foreground">Use a direct HTTPS video file link, not a video platform page. Leave blank to hide the video.</p>
      {url && <Button type="button" size="sm" variant="ghost" disabled={uploading} onClick={() => { setUrl(""); setMessage("Video link cleared. Save the product to apply. The stored file will not be deleted."); }}>Clear video link</Button>}
      {isProductVideoUrl(url) && (
        <video key={url} src={url} controls playsInline preload="metadata" className="max-h-64 w-full rounded-md bg-slate-950" aria-label="Product video preview" />
      )}
    </div>
  );
}
