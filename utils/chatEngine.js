// Server-only. One place that turns a question plus the user's snapshot into a
// coach reply, shared by whatever surface asks (the persisted chat actions
// today; anything else later).

import {
  MISSING_KEY_MESSAGE,
  describeGeminiError,
  generateContent,
  hasGeminiKey,
} from "./geminiClient";
import { CHAT_SYSTEM_PROMPT } from "./chatPrompt";

/** Thrown with a message that is safe to show the user. */
export class ChatEngineError extends Error {
  constructor(message, status = 500) {
    super(message);
    this.name = "ChatEngineError";
    this.status = status;
  }
}

/** How many earlier turns the model sees. Older context is still in the DB. */
const HISTORY_TURNS = 12;

/**
 * Transcript turns as Gemini accepts them: `assistant` becomes `model`, the
 * trailing slice keeps the prompt bounded, and leading model turns are dropped
 * because a Gemini conversation must open on a user turn. Earlier attachments
 * are represented by name only; the reply that discussed them is the memory.
 */
export function toGeminiHistory(history) {
  const turns = (Array.isArray(history) ? history : [])
    .slice(-HISTORY_TURNS)
    .filter((m) => m?.text && (m.role === "user" || m.role === "assistant"))
    .map((m) => {
      const names = (m.attachments || []).map((a) => a.name).filter(Boolean);
      const prefix = names.length ? `[Attached earlier: ${names.join(", ")}]\n` : "";
      return {
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: `${prefix}${String(m.text).slice(0, 4000)}` }],
      };
    });

  const first = turns.findIndex((t) => t.role === "user");
  return first === -1 ? [] : turns.slice(first);
}

/**
 * The user's new turn as Gemini parts. Images and PDFs go as inline data the
 * model reads directly; text-like files are quoted into the message.
 */
function userParts(question, attachments = []) {
  const parts = [];
  const textFiles = [];

  for (const file of attachments) {
    if (file.kind === "image" || file.kind === "pdf") {
      parts.push({ inlineData: { mimeType: file.mimeType, data: file.data } });
    } else if (file.kind === "text") {
      textFiles.push(`--- ${file.name} ---\n${file.data}\n--- end of ${file.name} ---`);
    }
  }

  const names = attachments.map((a) => a.name).join(", ");
  const lead = attachments.length ? `[Attached: ${names}]\n` : "";
  const quoted = textFiles.length ? `\n\n${textFiles.join("\n\n")}` : "";
  parts.push({ text: `${lead}${String(question).slice(0, 4000)}${quoted}` });
  return parts;
}

/**
 * @param {object} args
 * @param {string} args.question     The new user message.
 * @param {Array}  args.history      Earlier turns as `{ role, text, attachments? }`.
 * @param {string} args.context      FINANCIAL CONTEXT text for this user.
 * @param {Array}  args.attachments  Files on this turn as `{ name, mimeType, kind, data }`.
 * @returns {Promise<string>} The coach's reply in markdown-lite.
 */
export async function answerFinanceQuestion({ question, history = [], context = "", attachments = [] }) {
  if (!hasGeminiKey()) throw new ChatEngineError(MISSING_KEY_MESSAGE, 503);

  try {
    return await generateContent({
      system: `${CHAT_SYSTEM_PROMPT}\n\nFINANCIAL CONTEXT\n${context || "(no data recorded yet)"}`,
      contents: [...toGeminiHistory(history), { role: "user", parts: userParts(question, attachments) }],
      // Plans with an allocation and a couple of follow-up questions need more
      // room than a three-sentence answer does; statements need more still.
      generationConfig: { temperature: 0.5, maxOutputTokens: attachments.length ? 2200 : 1500 },
    });
  } catch (error) {
    const { status, error: message } = describeGeminiError(error, "chat");
    throw new ChatEngineError(message, status);
  }
}
