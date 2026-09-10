"use server";

import { and, asc, desc, eq, sql } from "drizzle-orm";

import { db } from "@/utils/dbConfig";
import { ChatAttachments, ChatMessages, Chats } from "@/utils/schema";
import { answerFinanceQuestion, ChatEngineError } from "@/utils/chatEngine";
import { buildSnapshotFor } from "@/utils/financialSnapshot";
import {
  IMAGE_TYPES,
  MAX_ATTACHMENTS,
  MAX_FILE_BYTES,
  MAX_TEXT_CHARS,
  MAX_THUMB_BYTES,
  MAX_TOTAL_BYTES,
  PDF_TYPE,
  formatBytes,
  kindOf,
  payloadBytes,
} from "@/utils/attachments";
import { ActionError, requireEmail, requireId, requireProfile, requireText, run } from "./_shared";

// The database sits in another region, so every round trip costs real time.
// Each action below issues its queries in one parallel wave wherever the
// results do not depend on each other.

const TITLE_LENGTH = 48;
const MAX_MESSAGE = 4000;
const HISTORY_TURNS = 12;
const BASE64 = /^[A-Za-z0-9+/]+={0,2}$/;

/** First message, tidied and trimmed at a word boundary, becomes the title. */
function titleFrom(text, attachments = []) {
  const clean = text.replace(/\s+/g, " ").trim();
  const source = clean || (attachments[0] ? `About ${attachments[0].name}` : "New chat");
  if (source.length <= TITLE_LENGTH) return source;
  const cut = source.slice(0, TITLE_LENGTH);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 24))}…`;
}

const chatSummary = (row) => ({
  id: row.id,
  title: row.title,
  createdAt: new Date(row.createdAt).toISOString(),
  updatedAt: new Date(row.updatedAt).toISOString(),
});

/**
 * Attachment as the client renders it. Images carry a small thumbnail so the
 * transcript can show them again without shipping the full file back; PDFs
 * and text files are shown as chips, so their bytes stay on the server.
 */
const attachmentView = (row) => ({
  id: row.id,
  name: row.name,
  mimeType: row.mimeType,
  kind: row.kind,
  size: row.size,
  previewUrl:
    row.kind === "image"
      ? row.thumb
        ? `data:image/jpeg;base64,${row.thumb}`
        : row.data
          ? `data:${row.mimeType};base64,${row.data}`
          : null
      : null,
});

const messageView = (row, attachments = []) => ({
  id: row.id,
  role: row.role,
  text: row.content,
  createdAt: new Date(row.createdAt).toISOString(),
  attachments: attachments.map(attachmentView),
});

async function ownedChat(id, email) {
  const [chat] = await db
    .select()
    .from(Chats)
    .where(and(eq(Chats.createdBy, email), eq(Chats.id, id)));
  if (!chat) throw new ActionError("That conversation does not exist or is not yours.");
  return chat;
}

/**
 * The full transcript in one query: messages left-joined to their attachments.
 * Full image bytes are only selected for rows that predate thumbnails.
 */
async function transcriptOf(chatId) {
  const rows = await db
    .select({
      id: ChatMessages.id,
      role: ChatMessages.role,
      content: ChatMessages.content,
      createdAt: ChatMessages.createdAt,
      attachmentId: ChatAttachments.id,
      name: ChatAttachments.name,
      mimeType: ChatAttachments.mimeType,
      kind: ChatAttachments.kind,
      size: ChatAttachments.size,
      thumb: ChatAttachments.thumb,
      data: sql`case when ${ChatAttachments.kind} = 'image' and ${ChatAttachments.thumb} is null then ${ChatAttachments.data} else null end`,
    })
    .from(ChatMessages)
    .leftJoin(ChatAttachments, eq(ChatAttachments.messageId, ChatMessages.id))
    .where(eq(ChatMessages.chatId, chatId))
    .orderBy(asc(ChatMessages.id), asc(ChatAttachments.id));

  const messages = [];
  const byId = new Map();
  for (const row of rows) {
    let entry = byId.get(row.id);
    if (!entry) {
      entry = { row, attachments: [] };
      byId.set(row.id, entry);
      messages.push(entry);
    }
    if (row.attachmentId) {
      entry.attachments.push({
        id: row.attachmentId,
        name: row.name,
        mimeType: row.mimeType,
        kind: row.kind,
        size: row.size,
        thumb: row.thumb,
        data: row.data,
      });
    }
  }
  return messages.map(({ row, attachments }) => messageView(row, attachments));
}

/** Just what the model needs from earlier turns: text plus attachment names. */
async function historyOf(chatId) {
  const rows = await db
    .select({
      id: ChatMessages.id,
      role: ChatMessages.role,
      text: ChatMessages.content,
      names: sql`string_agg(${ChatAttachments.name}, ', ' order by ${ChatAttachments.id})`,
    })
    .from(ChatMessages)
    .leftJoin(ChatAttachments, eq(ChatAttachments.messageId, ChatMessages.id))
    .where(eq(ChatMessages.chatId, chatId))
    .groupBy(ChatMessages.id)
    .orderBy(desc(ChatMessages.id))
    .limit(HISTORY_TURNS);

  return rows.reverse().map((row) => ({
    role: row.role,
    text: row.text,
    attachments: row.names ? row.names.split(", ").map((name) => ({ name })) : [],
  }));
}

/** The client's attachment list, re-validated: types, sizes, counts, encoding. */
function validateAttachments(input) {
  if (!Array.isArray(input) || input.length === 0) return [];
  if (input.length > MAX_ATTACHMENTS) {
    throw new ActionError(`Attach at most ${MAX_ATTACHMENTS} files per message.`);
  }

  let total = 0;
  const clean = input.map((file) => {
    const name = requireText(file?.name, "File name").slice(0, 160);
    const mimeType = typeof file?.mimeType === "string" ? file.mimeType.toLowerCase() : "";
    const kind = kindOf(name, mimeType);
    if (!kind || kind !== file?.kind) {
      throw new ActionError(`${name}: only images, PDFs and text or CSV files are supported.`);
    }
    if (typeof file.data !== "string" || !file.data) throw new ActionError(`${name}: the file was empty.`);

    if (kind === "text") {
      const data = file.data.slice(0, MAX_TEXT_CHARS);
      return { name, mimeType: mimeType || "text/plain", kind, data, thumb: null, size: data.length };
    }

    const data = file.data.replace(/\s+/g, "");
    if (!BASE64.test(data)) throw new ActionError(`${name}: the file could not be decoded.`);

    let thumb = null;
    if (kind === "image" && typeof file.thumb === "string" && file.thumb) {
      const candidate = file.thumb.replace(/\s+/g, "");
      if (BASE64.test(candidate) && (candidate.length * 3) / 4 <= MAX_THUMB_BYTES) thumb = candidate;
    }

    const resolvedType = kind === "pdf" ? PDF_TYPE : IMAGE_TYPES.includes(mimeType) ? mimeType : "image/jpeg";
    const record = { name, mimeType: resolvedType, kind, data, thumb };
    return { ...record, size: payloadBytes(record) };
  });

  for (const file of clean) {
    if (file.size > MAX_FILE_BYTES) {
      throw new ActionError(`${file.name}: ${formatBytes(file.size)} is over the ${formatBytes(MAX_FILE_BYTES)} limit.`);
    }
    total += file.size;
  }
  if (total > MAX_TOTAL_BYTES) {
    throw new ActionError(`Attachments add up to ${formatBytes(total)}; the limit per message is ${formatBytes(MAX_TOTAL_BYTES)}.`);
  }
  return clean;
}

/** Every conversation of the signed-in user, most recently active first. */
export async function listChats() {
  return run(async () => {
    const email = await requireEmail();
    const rows = await db
      .select()
      .from(Chats)
      .where(eq(Chats.createdBy, email))
      .orderBy(desc(Chats.updatedAt));
    return rows.map(chatSummary);
  });
}

/** One conversation with its full transcript, oldest message first. */
export async function getChat(chatId) {
  return run(async () => {
    const id = requireId(chatId, "conversation");
    const email = await requireEmail();
    // Ownership and transcript in the same round trip; the transcript is
    // discarded if the ownership check throws.
    const [chat, messages] = await Promise.all([ownedChat(id, email), transcriptOf(id)]);
    return { chat: chatSummary(chat), messages };
  });
}

export async function renameChat(chatId, title) {
  return run(async () => {
    const id = requireId(chatId, "conversation");
    const email = await requireEmail();
    const [updated] = await db
      .update(Chats)
      .set({ title: requireText(title, "Title").slice(0, 80) })
      .where(and(eq(Chats.createdBy, email), eq(Chats.id, id)))
      .returning();
    if (!updated) throw new ActionError("That conversation does not exist or is not yours.");
    return chatSummary(updated);
  });
}

export async function deleteChat(chatId) {
  return run(async () => {
    const id = requireId(chatId, "conversation");
    const email = await requireEmail();
    await ownedChat(id, email);
    // One transaction, one round trip, in dependency order.
    await db.batch([
      db
        .delete(ChatAttachments)
        .where(
          sql`${ChatAttachments.messageId} in (select ${ChatMessages.id} from ${ChatMessages} where ${ChatMessages.chatId} = ${id})`
        ),
      db.delete(ChatMessages).where(eq(ChatMessages.chatId, id)),
      db.delete(Chats).where(eq(Chats.id, id)),
    ]);
    return { id };
  });
}

/**
 * Sends one user message, with optional attachments, and returns the reply.
 *
 * With no `chatId` a new conversation is created and titled from the message.
 * The model sees the stored transcript, not whatever the browser holds, so a
 * refreshed page or a second device continues the same thread. Nothing is
 * written until the model has answered: a failed call leaves no half-turn
 * behind, and a brand-new chat that never got an answer is removed again.
 */
export async function sendMessage({ chatId = null, text = "", attachments = [] } = {}) {
  return run(async () => {
    const { email, firstName } = await requireProfile();
    const files = validateAttachments(attachments);
    const typed = typeof text === "string" ? text.trim().slice(0, MAX_MESSAGE) : "";
    if (!typed && !files.length) throw new ActionError("Message is required.");
    // A bare attachment still needs a question for the model to answer.
    const question = typed || "What can you tell me about this? Pull out the figures and connect them to my numbers.";

    const existingId = chatId !== null && chatId !== undefined ? requireId(chatId, "conversation") : null;

    // Everything the model needs, fetched at once: the chat (created or
    // verified), the earlier turns, and the user's financial snapshot.
    const [chat, history, context] = await Promise.all([
      existingId
        ? ownedChat(existingId, email)
        : db
            .insert(Chats)
            .values({ title: titleFrom(typed, files), createdBy: email })
            .returning()
            .then((rows) => rows[0]),
      existingId ? historyOf(existingId) : Promise.resolve([]),
      buildSnapshotFor({ email, firstName }),
    ]);
    const created = !existingId;

    try {
      const reply = await answerFinanceQuestion({ question, history, context, attachments: files });

      const [userRow, assistantRow] = await db
        .insert(ChatMessages)
        .values([
          { chatId: chat.id, role: "user", content: question },
          { chatId: chat.id, role: "assistant", content: reply },
        ])
        .returning();

      const [storedFiles, [touched]] = await Promise.all([
        files.length
          ? db
              .insert(ChatAttachments)
              .values(files.map((file) => ({ ...file, messageId: userRow.id })))
              .returning()
          : Promise.resolve([]),
        db.update(Chats).set({ updatedAt: sql`now()` }).where(eq(Chats.id, chat.id)).returning(),
      ]);

      return {
        chat: chatSummary(touched ?? chat),
        created,
        messages: [messageView(userRow, storedFiles), messageView(assistantRow)],
      };
    } catch (error) {
      if (created) {
        await db.delete(Chats).where(eq(Chats.id, chat.id)).catch(() => {});
      }
      if (error instanceof ChatEngineError) throw new ActionError(error.message);
      throw error;
    }
  });
}
