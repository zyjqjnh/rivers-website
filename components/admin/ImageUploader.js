"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ImagePlus, LoaderCircle, Trash2, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function ImageUploader({ initialUrls = [], storageReady }) {
  const [urls, setUrls] = useState(initialUrls);
  const [uploading, setUploading] = useState([]);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function uploadFiles(files) {
    const selectedFiles = Array.from(files);
    if (!selectedFiles.length) return;

    setError("");
    const invalid = selectedFiles.find((file) => !ACCEPTED_TYPES.includes(file.type) || file.size > MAX_FILE_SIZE);
    if (invalid) {
      setError(`${invalid.name} 不是支持的图片格式，或文件超过 10 MB。`);
      return;
    }

    const pending = selectedFiles.map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      preview: URL.createObjectURL(file),
    }));
    setUploading((current) => [...current, ...pending]);

    await Promise.all(
      selectedFiles.map(async (file, index) => {
        const item = pending[index];
        try {
          const signatureResponse = await fetch("/api/admin/uploads", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ filename: file.name, contentType: file.type, size: file.size }),
          });
          const signature = await signatureResponse.json();
          if (!signatureResponse.ok) throw new Error(signature.error || "无法准备上传。");

          const uploadResponse = await fetch(signature.uploadUrl, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!uploadResponse.ok) throw new Error("R2 上传失败，请检查存储桶 CORS 设置。");

          setUrls((current) => [...current, signature.publicUrl]);
        } catch (uploadError) {
          setError(uploadError.message || "图片上传失败，请重试。");
        } finally {
          URL.revokeObjectURL(item.preview);
          setUploading((current) => current.filter((upload) => upload.id !== item.id));
        }
      })
    );
  }

  function handleDrop(event) {
    event.preventDefault();
    if (storageReady) uploadFiles(event.dataTransfer.files);
  }

  function move(index, offset) {
    const target = index + offset;
    if (target < 0 || target >= urls.length) return;
    setUrls((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function updateFromText(value) {
    setUrls(value.split("\n").map((url) => url.trim()).filter(Boolean));
  }

  return (
    <div className="space-y-4">
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        onChange={(event) => {
          uploadFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <button
        type="button"
        disabled={!storageReady}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        className="flex min-h-36 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center transition hover:border-emerald-400 hover:bg-emerald-50/40 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className="rounded-full bg-white p-3 text-emerald-700 shadow-sm"><UploadCloud className="h-5 w-5" /></span>
        <span className="text-sm font-semibold text-slate-800">{storageReady ? "拖拽图片到这里，或点击选择文件" : "配置 R2 后即可直接上传图片"}</span>
        <span className="text-xs text-slate-500">JPG、PNG、WebP、GIF 或 AVIF，单张不超过 10 MB</span>
      </button>

      {(urls.length > 0 || uploading.length > 0) && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {urls.map((url, index) => (
            <div key={`${url}-${index}`} className="group overflow-hidden rounded-lg border bg-white">
              <div className="aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-contain" />
              </div>
              <div className="flex items-center gap-1 border-t p-2">
                <span className="min-w-0 flex-1 truncate px-1 text-xs text-slate-500">{index === 0 ? "主图" : `图片 ${index + 1}`}</span>
                <Button type="button" variant="ghost" size="icon" aria-label="向前移动" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp /></Button>
                <Button type="button" variant="ghost" size="icon" aria-label="向后移动" disabled={index === urls.length - 1} onClick={() => move(index, 1)}><ArrowDown /></Button>
                <Button type="button" variant="ghost" size="icon" aria-label="删除图片" onClick={() => setUrls((current) => current.filter((_, itemIndex) => itemIndex !== index))}><Trash2 /></Button>
              </div>
            </div>
          ))}
          {uploading.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-lg border bg-white">
              <div className="relative aspect-[4/3] bg-slate-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.preview} alt="" className="h-full w-full object-contain opacity-50" />
                <div className="absolute inset-0 grid place-items-center"><LoaderCircle className="h-7 w-7 animate-spin text-emerald-700" /></div>
              </div>
              <p className="truncate border-t p-3 text-xs text-slate-500">正在上传 {item.name}</p>
            </div>
          ))}
        </div>
      )}

      {urls.length === 0 && uploading.length === 0 && (
        <div className="flex items-center gap-2 rounded-md border bg-white px-4 py-3 text-xs text-slate-500">
          <ImagePlus className="h-4 w-4" /> 暂无产品图片
        </div>
      )}

      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}

      <details className="rounded-md border bg-white px-4 py-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-700">手动编辑图片 URL</summary>
        <div className="pt-3">
          <Textarea
            name="imageUrls"
            value={urls.join("\n")}
            onChange={(event) => updateFromText(event.target.value)}
            placeholder={"/assets/product.jpg\nhttps://images.example.com/product-side.jpg"}
          />
          <p className="mt-2 text-xs leading-5 text-slate-500">每行一个地址。也可继续使用本地 `/assets/...` 图片。</p>
        </div>
      </details>
    </div>
  );
}
