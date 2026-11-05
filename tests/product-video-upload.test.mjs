import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { createContext, SourceTextModule, SyntheticModule } from "node:vm";
import test from "node:test";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const root = new URL("../", import.meta.url);
const credentials = {
  R2_ACCOUNT_ID: "test-account",
  R2_ACCESS_KEY_ID: "test-key",
  R2_SECRET_ACCESS_KEY: "test-secret",
};

async function loadModule(path, { env = {}, mocks = {}, globals = {} } = {}) {
  const context = createContext({ process: { env }, URL, ...globals });
  const cache = new Map();
  async function load(id) {
    if (cache.has(id)) return cache.get(id);
    let module;
    if (Object.hasOwn(mocks, id)) {
      const values = mocks[id];
      module = new SyntheticModule(Object.keys(values), function () {
        for (const [name, value] of Object.entries(values)) this.setExport(name, value);
      }, { context });
    } else {
      const localPath = id.startsWith("@/") ? `${id.slice(2)}.js` : id;
      module = new SourceTextModule(await readFile(new URL(localPath, root), "utf8"), { context, identifier: id });
    }
    cache.set(id, module);
    await module.link(load);
    return module;
  }
  const module = await load(path);
  await module.evaluate();
  return module.namespace;
}

async function route({ authenticated = true, configured = true, signer } = {}) {
  const calls = [];
  const module = await loadModule("app/api/admin/video-uploads/route.js", {
    env: { R2_VIDEO_BUCKET_NAME: "anrivers-videos", R2_VIDEO_PUBLIC_URL: "https://video.anrivers.com" },
    mocks: {
      "node:crypto": { randomUUID },
      "@aws-sdk/client-s3": { PutObjectCommand },
      "@aws-sdk/s3-request-presigner": { getSignedUrl: async (client, command, options) => {
        calls.push({ command: command.input, options });
        return signer ? signer() : "https://r2.example/signed-put";
      } },
      "next/server": { NextResponse: Response },
      "@/lib/auth": { isAdminAuthenticated: async () => authenticated },
      "@/lib/r2": {
        isR2VideoConfigured: configured,
        getR2Client: () => ({}),
        getR2PublicUrl: (key, base) => `${base}/${key}`,
      },
    },
  });
  return { post: module.POST, calls };
}

const validInput = { filename: "product-demo.mp4", contentType: "video/mp4", size: 1024 };
const request = (body) => new Request("http://localhost/api/admin/video-uploads", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

test("unauthenticated requests cannot obtain an upload signature", async () => {
  const { post, calls } = await route({ authenticated: false });
  assert.equal((await post(request(validInput))).status, 401);
  assert.equal(calls.length, 0);
});

test("missing video config returns 503", async () => {
  const { post } = await route({ configured: false });
  assert.equal((await post(request(validInput))).status, 503);
});

test("malformed JSON returns 400", async () => {
  const { post } = await route();
  assert.equal((await post(new Request("http://localhost", { method: "POST", body: "{" }))).status, 400);
});

test("invalid upload bodies are rejected without signing", async () => {
  const { post, calls } = await route();
  for (const body of [null, [], {}, { ...validInput, filename: "video.mov" },
    { ...validInput, contentType: "image/png" }, { ...validInput, size: 0 },
    { ...validInput, size: -1 }, { ...validInput, size: 1.5 },
    { ...validInput, size: "1024" }, { ...validInput, size: 100 * 1024 * 1024 + 1 }]) {
    assert.equal((await post(request(body))).status, 400, JSON.stringify(body));
  }
  assert.equal(calls.length, 0);
});

test("valid MP4 at the size limit signs the video bucket, length, type, and cache metadata", async () => {
  const { post, calls } = await route();
  const response = await post(request({ ...validInput, filename: "DEMO.MP4", size: 100 * 1024 * 1024 }));
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  const result = await response.json();
  const [{ command, options }] = calls;
  assert.equal(command.Bucket, "anrivers-videos");
  assert.match(command.Key, /^product-videos\/\d{4}\/\d{2}\/[a-f0-9-]+\.mp4$/);
  assert.equal(command.ContentLength, 100 * 1024 * 1024);
  assert.equal(command.ContentType, "video/mp4");
  assert.equal(command.CacheControl, "public, max-age=31536000, immutable");
  assert.equal(options.expiresIn, 300);
  assert.deepEqual([...options.signableHeaders].sort(), ["cache-control", "content-type"]);
  assert.equal(result.publicUrl, `https://video.anrivers.com/${command.Key}`);
  assert.equal(result.headers["Content-Type"], command.ContentType);
  assert.equal(result.headers["Cache-Control"], command.CacheControl);
  assert.ok(!JSON.stringify(result).includes("test-secret"));
});

test("replacement uploads use distinct object URLs", async () => {
  const { post } = await route();
  const first = await (await post(request(validInput))).json();
  const second = await (await post(request(validInput))).json();
  assert.notEqual(first.publicUrl, second.publicUrl);
});

test("signing failures return a safe retryable error", async () => {
  const { post } = await route({ signer: () => { throw new Error("secret internal details"); } });
  const response = await post(request(validInput));
  assert.equal(response.status, 500);
  assert.ok(!(await response.text()).includes("secret internal details"));
});

test("image and video readiness are independent and share only credentials", async () => {
  for (const [extra, images, videos] of [
    [{ R2_BUCKET_NAME: "images", R2_PUBLIC_URL: "https://images.example" }, true, false],
    [{ R2_VIDEO_BUCKET_NAME: "videos", R2_VIDEO_PUBLIC_URL: "https://video.example/" }, false, true],
    [{}, false, false],
  ]) {
    const module = await loadModule("lib/r2.js", {
      env: { ...credentials, ...extra },
      mocks: { "server-only": {}, "@aws-sdk/client-s3": { S3Client } },
    });
    assert.equal(module.isR2Configured, images);
    assert.equal(module.isR2VideoConfigured, videos);
    assert.doesNotThrow(() => module.getR2Client());
    if (videos) assert.equal(module.getR2PublicUrl("product-videos/demo clip.mp4", extra.R2_VIDEO_PUBLIC_URL), "https://video.example/product-videos/demo%20clip.mp4");
  }
});

test("missing shared credentials disable both storage types", async () => {
  const module = await loadModule("lib/r2.js", {
    env: { R2_BUCKET_NAME: "images", R2_PUBLIC_URL: "https://images.example", R2_VIDEO_BUCKET_NAME: "videos", R2_VIDEO_PUBLIC_URL: "https://video.example" },
    mocks: { "server-only": {}, "@aws-sdk/client-s3": { S3Client } },
  });
  assert.equal(module.isR2Configured, false);
  assert.equal(module.isR2VideoConfigured, false);
  assert.throws(() => module.getR2Client());
});

test("real SDK signature binds content length and metadata for browser PUT", async () => {
  const client = new S3Client({
    region: "auto", endpoint: "https://test-account.r2.cloudflarestorage.com",
    credentials: { accessKeyId: "test-key", secretAccessKey: "test-secret" },
    requestChecksumCalculation: "WHEN_REQUIRED",
  });
  const url = new URL(await getSignedUrl(client, new PutObjectCommand({
    Bucket: "anrivers-videos", Key: "product-videos/test.mp4", ContentLength: 1024,
    ContentType: "video/mp4", CacheControl: "public, max-age=31536000, immutable",
  }), { expiresIn: 300, signableHeaders: new Set(["content-type", "cache-control"]) }));
  assert.equal(url.searchParams.get("X-Amz-Expires"), "300");
  assert.ok(url.searchParams.get("X-Amz-SignedHeaders").includes("content-length"));
  assert.ok(url.searchParams.get("X-Amz-SignedHeaders").includes("content-type"));
  assert.ok(url.searchParams.get("X-Amz-SignedHeaders").includes("cache-control"));
});

async function clientTransport() {
  const requests = [];
  class FakeXHR {
    constructor() { this.upload = {}; this.headers = {}; requests.push(this); }
    open(method, url) { this.method = method; this.url = url; }
    setRequestHeader(name, value) { this.headers[name] = value; }
    send(file) { this.file = file; }
    abort() { this.aborted = true; this.onabort?.(); }
  }
  const { putVideo } = await loadModule("lib/video-upload-client.js", { globals: { XMLHttpRequest: FakeXHR, DOMException } });
  return { putVideo, requests };
}
const signature = { uploadUrl: "https://r2.example/signed-put", headers: { "Content-Type": "video/mp4", "Cache-Control": "public, max-age=31536000, immutable" } };

test("browser PUT reports progress and resolves only after R2 success", async () => {
  const { putVideo, requests } = await clientTransport();
  const file = { name: "demo.mp4" };
  const progress = [];
  const pending = putVideo(signature, file, new AbortController().signal, (value) => progress.push(value));
  const [xhr] = requests;
  assert.equal(xhr.method, "PUT");
  assert.equal(xhr.url, signature.uploadUrl);
  assert.equal(xhr.file, file);
  assert.equal(xhr.headers["Cache-Control"], signature.headers["Cache-Control"]);
  xhr.upload.onprogress({ lengthComputable: true, loaded: 512, total: 1024 });
  xhr.status = 200;
  xhr.onload();
  await pending;
  assert.deepEqual(progress, [50]);
});

test("cancelling a pending browser upload aborts the request", async () => {
  const { putVideo, requests } = await clientTransport();
  const controller = new AbortController();
  const pending = putVideo(signature, {}, controller.signal, () => {});
  controller.abort();
  await assert.rejects(pending, { name: "AbortError" });
  assert.equal(requests[0].aborted, true);
});

test("an already-cancelled upload never sends the file", async () => {
  const { putVideo, requests } = await clientTransport();
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(putVideo(signature, {}, controller.signal, () => {}), { name: "AbortError" });
  assert.equal(requests[0].file, undefined);
});

test("R2 rejection, network failure, and timeout reject so the form can preserve its previous URL", async () => {
  for (const failure of ["rejected", "network", "timeout"]) {
    const { putVideo, requests } = await clientTransport();
    const pending = putVideo(signature, {}, new AbortController().signal, () => {});
    const [xhr] = requests;
    if (failure === "rejected") { xhr.status = 403; xhr.onload(); }
    if (failure === "network") xhr.onerror();
    if (failure === "timeout") xhr.ontimeout();
    await assert.rejects(pending, /retry/i);
  }
});
