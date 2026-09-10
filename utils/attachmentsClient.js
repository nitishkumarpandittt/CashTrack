"use client";

// Browser-side preparation of files for the chat: images are downscaled and
// re-encoded so a phone photo of a receipt does not weigh 8 MB, PDFs are
// base64-encoded as-is, and text-like files are read as text.

import {
  MAX_ATTACHMENTS,
  MAX_FILE_BYTES,
  MAX_TEXT_CHARS,
  MAX_TOTAL_BYTES,
  formatBytes,
  kindOf,
  payloadBytes,
} from "./attachments";

const MAX_IMAGE_EDGE = 1600;
const THUMB_EDGE = 360;

const readAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsDataURL(file);
  });

const readAsText = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.readAsText(file);
  });

const loadImage = (dataUrl) =>
  new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That image could not be decoded."));
    img.src = dataUrl;
  });

function drawScaled(img, maxEdge, quality) {
  const scale = Math.min(1, maxEdge / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

/**
 * Downscale to MAX_IMAGE_EDGE and re-encode as JPEG, plus a small thumbnail
 * for the transcript; falls back to the original if the canvas is unavailable.
 */
async function prepareImage(file) {
  const original = await readAsDataUrl(file);
  try {
    const img = await loadImage(original);
    return {
      mimeType: "image/jpeg",
      dataUrl: drawScaled(img, MAX_IMAGE_EDGE, 0.85),
      thumbUrl: drawScaled(img, THUMB_EDGE, 0.7),
    };
  } catch {
    return { mimeType: file.type || "image/jpeg", dataUrl: original, thumbUrl: null };
  }
}

const stripDataUrl = (dataUrl) => dataUrl.slice(dataUrl.indexOf(",") + 1);

/**
 * Turns picked File objects into attachment records ready to send:
 * `{ id, name, mimeType, kind, size, data, previewUrl }`. Files the coach
 * cannot read, or that break the size rules, are reported in `rejected`.
 */
export async function prepareAttachments(files, existing = []) {
  const accepted = [];
  const rejected = [];
  let total = existing.reduce((sum, a) => sum + payloadBytes(a), 0);
  let count = existing.length;

  for (const file of Array.from(files)) {
    if (count >= MAX_ATTACHMENTS) {
      rejected.push(`${file.name}: at most ${MAX_ATTACHMENTS} files per message.`);
      continue;
    }
    const kind = kindOf(file.name, file.type);
    if (!kind) {
      rejected.push(`${file.name}: only images, PDFs and text or CSV files are supported.`);
      continue;
    }

    try {
      let record;
      if (kind === "image") {
        const { mimeType, dataUrl, thumbUrl } = await prepareImage(file);
        record = {
          name: file.name,
          mimeType,
          kind,
          data: stripDataUrl(dataUrl),
          thumb: thumbUrl ? stripDataUrl(thumbUrl) : null,
          previewUrl: dataUrl,
        };
      } else if (kind === "pdf") {
        const dataUrl = await readAsDataUrl(file);
        record = { name: file.name, mimeType: "application/pdf", kind, data: stripDataUrl(dataUrl), previewUrl: null };
      } else {
        const textContent = (await readAsText(file)).slice(0, MAX_TEXT_CHARS);
        record = { name: file.name, mimeType: file.type || "text/plain", kind, data: textContent, previewUrl: null };
      }

      const size = payloadBytes(record);
      if (size > MAX_FILE_BYTES) {
        rejected.push(`${file.name}: ${formatBytes(size)} is over the ${formatBytes(MAX_FILE_BYTES)} limit.`);
        continue;
      }
      if (total + size > MAX_TOTAL_BYTES) {
        rejected.push(`${file.name}: would push this message past ${formatBytes(MAX_TOTAL_BYTES)} of attachments.`);
        continue;
      }

      total += size;
      count += 1;
      accepted.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, size, ...record });
    } catch (error) {
      rejected.push(`${file.name}: ${error.message}`);
    }
  }

  return { accepted, rejected };
}

/** The shape the server action wants: no preview URLs, no client ids. */
export function toPayload(attachments) {
  return attachments.map(({ name, mimeType, kind, data, thumb }) => ({
    name,
    mimeType,
    kind,
    data,
    thumb: thumb ?? null,
  }));
}
