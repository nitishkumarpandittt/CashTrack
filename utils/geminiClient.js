/**
 * Server-only Gemini access, over the REST API.
 *
 * The key is read from GEMINI_API_KEY — deliberately *without* a NEXT_PUBLIC_
 * prefix, so Next never inlines it into the client bundle. Only route handlers
 * under app/api may import this module.
 *
 * Plain fetch rather than an SDK: the two calls this app makes (one JSON-shaped
 * brief, one chat turn) are a thin slice of the API, and @google/generative-ai
 * — the package the old Gemini code used — is deprecated.
 */

const ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models";
const TIMEOUT_MS = 45_000;

/**
 * Free-tier model availability moves, and this app has already been broken
 * twice by it: gemini-2.0-flash now reports a free-tier limit of 0, and
 * gemini-2.5-flash 404s for keys created after its retirement. So the request
 * walks a list rather than trusting a single name — the configured model first,
 * then aliases that survive individual models being retired.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

const MODEL_CHAIN = [...new Set([GEMINI_MODEL, "gemini-flash-lite-latest", "gemini-3.5-flash"])];

export const MISSING_KEY_MESSAGE =
  "The assistant needs a Gemini API key. Add GEMINI_API_KEY to .env.local and restart the server.";

export function hasGeminiKey() {
  return Boolean(process.env.GEMINI_API_KEY);
}

/** Thrown for anything the API reports; `status` is the HTTP code it returned. */
class GeminiError extends Error {
  constructor(message, status, code) {
    super(message);
    this.name = "GeminiError";
    this.status = status;
    this.code = code;
  }
}

/**
 * A reply can arrive split across several parts, and reasoning models add parts
 * flagged `thought` that are commentary rather than answer. Join the real text
 * and drop the rest — concatenating everything would corrupt a JSON response.
 */
function readText(candidate) {
  const parts = candidate?.content?.parts;
  if (!Array.isArray(parts)) return "";
  return parts
    .filter((p) => typeof p?.text === "string" && !p.thought)
    .map((p) => p.text)
    .join("")
    .trim();
}

async function callModel(model, body, signal) {
  const res = await fetch(`${ENDPOINT}/${model}:generateContent`, {
    method: "POST",
    // The key travels in a header, never in the query string, so it cannot end
    // up in a proxy or server access log.
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY,
    },
    body: JSON.stringify(body),
    signal,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const err = data?.error;
    throw new GeminiError(err?.message || `Gemini returned ${res.status}.`, res.status, err?.status);
  }

  const candidate = data?.candidates?.[0];
  const text = readText(candidate);

  if (!text) {
    // An empty reply is almost always one of these two, and they need different
    // advice, so classify rather than reporting "empty" for both.
    const reason = candidate?.finishReason || data?.promptFeedback?.blockReason;
    if (reason === "MAX_TOKENS") throw new GeminiError("Reply hit the token limit.", 502, reason);
    if (reason && reason !== "STOP") throw new GeminiError(`Reply blocked: ${reason}.`, 502, reason);
    throw new GeminiError("Gemini returned an empty reply.", 502, "EMPTY");
  }

  return text;
}

/**
 * Ask Gemini for one completion and return its text.
 *
 * @param {object}   options
 * @param {string}   options.system       System instruction.
 * @param {Array}    options.contents     Turns as `{ role: "user"|"model", parts }`.
 * @param {object}   options.generationConfig  Merged over the defaults below.
 * @returns {Promise<string>}
 */
export async function generateContent({ system, contents, generationConfig = {} }) {
  const body = {
    contents,
    generationConfig: { temperature: 0.4, maxOutputTokens: 1200, ...generationConfig },
  };
  if (system) body.systemInstruction = { parts: [{ text: system }] };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let lastError;
    for (const model of MODEL_CHAIN) {
      try {
        return await callModel(model, body, controller.signal);
      } catch (error) {
        // 404 means the model is gone for this key, 429 means its free-tier
        // quota is spent — both are worth trying the next model for. Anything
        // else (bad key, malformed request, blocked reply) would fail the same
        // way on every model, so it surfaces immediately.
        if (error?.status !== 404 && error?.status !== 429) throw error;
        lastError = error;
        console.warn(`[gemini] ${model} unavailable (${error.status}), trying the next model.`);
      }
    }
    throw lastError;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Turn an API error into something worth showing a user. Anything we cannot
 * classify is logged and reported generically rather than leaked to the client.
 */
export function describeGeminiError(error, label) {
  const status = error?.status;
  const message = String(error?.message || error);

  if (error?.name === "AbortError") {
    return { status: 504, error: "Gemini took too long to respond. Try again." };
  }
  if (status === 400 && /api key/i.test(message)) {
    return {
      status: 401,
      error: "That Gemini API key is not valid. Replace GEMINI_API_KEY in .env.local and restart.",
    };
  }
  if (status === 401 || status === 403) {
    return {
      status: 401,
      error: "That Gemini API key was rejected. Check GEMINI_API_KEY in .env.local and restart.",
    };
  }
  if (status === 429) {
    return {
      status: 429,
      error: "The free Gemini quota is used up for now. Try again in a minute.",
    };
  }
  if (status === 404) {
    return {
      status: 502,
      error: `The model "${GEMINI_MODEL}" is not available to this key. Set GEMINI_MODEL to one that is.`,
    };
  }
  if (status === 503) {
    return { status: 503, error: "Gemini is overloaded right now. Try again in a moment." };
  }

  console.error(`[${label}]`, message);
  return { status: 500, error: "The assistant could not answer just now." };
}
