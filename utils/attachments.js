// Attachment rules shared by the browser (validation, previews) and the
// server actions (validation again, since the client cannot be trusted).
// Kept free of browser-only APIs so the actions can import it.

export const MAX_ATTACHMENTS = 4;
/** Per-file cap after the browser has downscaled images, in bytes. */
export const MAX_FILE_BYTES = 6 * 1024 * 1024;
/** Total per message, in bytes, so one send stays well under the action body limit. */
export const MAX_TOTAL_BYTES = 10 * 1024 * 1024;
/** Image thumbnails shown in the transcript, in bytes. */
export const MAX_THUMB_BYTES = 160 * 1024;
/** Text-like files are inlined into the prompt; anything longer is truncated. */
export const MAX_TEXT_CHARS = 120_000;

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif"];
export const PDF_TYPE = "application/pdf";
export const TEXT_TYPES = ["text/plain", "text/csv", "text/markdown", "application/json"];
export const TEXT_EXTENSIONS = [".txt", ".csv", ".md", ".json", ".tsv"];

/** What the file picker offers. */
export const ACCEPT = [...IMAGE_TYPES, PDF_TYPE, ...TEXT_TYPES, ...TEXT_EXTENSIONS].join(",");

/** image | pdf | text, or null when the file is not something the coach can read. */
export function kindOf(name = "", mimeType = "") {
  const lower = String(name).toLowerCase();
  if (IMAGE_TYPES.includes(mimeType) || /\.(jpe?g|png|webp|gif|heic|heif)$/.test(lower)) return "image";
  if (mimeType === PDF_TYPE || lower.endsWith(".pdf")) return "pdf";
  if (TEXT_TYPES.includes(mimeType) || TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext))) return "text";
  return null;
}

export function formatBytes(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

/** Bytes an attachment's payload represents (base64 inflates by a third). */
export function payloadBytes(attachment) {
  if (!attachment?.data) return 0;
  if (attachment.kind === "text") return attachment.data.length;
  return Math.floor((attachment.data.length * 3) / 4);
}
