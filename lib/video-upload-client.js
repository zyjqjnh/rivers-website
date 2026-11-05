// XMLHttpRequest provides upload progress and abort support without buffering the file.
export function putVideo(signature, file, signal, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const abort = () => xhr.abort();
    function finish(error) {
      signal.removeEventListener("abort", abort);
      if (error) reject(error);
      else resolve();
    }
    xhr.open("PUT", signature.uploadUrl);
    for (const [name, value] of Object.entries(signature.headers)) xhr.setRequestHeader(name, value);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 100));
    };
    xhr.onload = () => finish(xhr.status >= 200 && xhr.status < 300 ? null : new Error("Video upload failed. Check R2 permissions and CORS, then retry."));
    xhr.onerror = () => finish(new Error("Video upload failed. Check your connection and R2 CORS, then retry."));
    xhr.onabort = () => finish(new DOMException("Upload cancelled", "AbortError"));
    xhr.ontimeout = () => finish(new Error("Video upload timed out. Please retry."));
    xhr.timeout = 30 * 60 * 1000;
    if (signal.aborted) return finish(new DOMException("Upload cancelled", "AbortError"));
    signal.addEventListener("abort", abort, { once: true });
    try {
      xhr.send(file);
    } catch (error) {
      finish(error);
    }
  });
}
