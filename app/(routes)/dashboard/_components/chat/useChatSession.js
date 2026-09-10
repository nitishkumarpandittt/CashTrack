"use client";

import { useCallback, useEffect, useState } from "react";

import { getChat, sendMessage } from "@/app/actions/chats";
import { callAction } from "@/utils/callAction";
import { toPayload } from "@/utils/attachmentsClient";

/**
 * Transcripts already fetched or produced in this tab, by chat id. Switching
 * back to a conversation renders from here instantly instead of showing a
 * skeleton while the same messages are fetched again. This client is the
 * only writer during a session, so the cache cannot go stale on its own; a
 * reload starts empty.
 */
const transcripts = new Map();

/** Drop a conversation from the cache (after it is deleted). */
export function forgetTranscript(chatId) {
  transcripts.delete(chatId);
}

/**
 * One conversation with CashTrack AI, shared by the sidebar panel and the
 * full-screen workspace.
 *
 * `chatId` null means "not started yet": the first send creates the
 * conversation on the server and `onChatCreated` is told the new record (the
 * workspace uses it to move the URL). When `chatId` points at an existing
 * conversation its transcript comes from the cache or the server.
 */
export function useChatSession({ chatId: requestedId = null, onChatCreated, onChatTouched } = {}) {
  const [chatId, setChatId] = useState(requestedId);
  // The prop value this hook's state was last aligned with. Comparing it to the
  // current prop during render is how a conversation switch resets the thread
  // without an effect that sets state synchronously.
  const [syncedWith, setSyncedWith] = useState(requestedId);
  const [messages, setMessages] = useState(() => transcripts.get(requestedId)?.messages ?? []);
  const [title, setTitle] = useState(() => transcripts.get(requestedId)?.title ?? "");
  // Which conversation's transcript `messages` currently holds.
  const [loadedFor, setLoadedFor] = useState(() => (transcripts.has(requestedId) ? requestedId : null));
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailed, setLastFailed] = useState(null);

  if (requestedId !== syncedWith) {
    setSyncedWith(requestedId);
    setError(null);
    setLastFailed(null);
    if (requestedId === chatId) {
      // The URL caught up with a conversation this hook just created; the
      // transcript on screen is already the right one.
      setLoadedFor(requestedId);
    } else {
      const cached = transcripts.get(requestedId);
      setChatId(requestedId);
      setMessages(cached?.messages ?? []);
      setTitle(cached?.title ?? "");
      setLoadedFor(cached ? requestedId : null);
    }
  }

  const loading = Boolean(requestedId) && loadedFor !== requestedId;

  useEffect(() => {
    if (!requestedId || loadedFor === requestedId) return undefined;

    let cancelled = false;
    callAction(getChat(requestedId))
      .then(({ chat, messages: rows }) => {
        transcripts.set(requestedId, { title: chat.title, messages: rows });
        if (cancelled) return;
        setTitle(chat.title);
        setMessages(rows);
        setLoadedFor(requestedId);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        setLoadedFor(requestedId);
      });

    return () => {
      cancelled = true;
    };
  }, [requestedId, loadedFor]);

  const send = useCallback(
    async (rawText, attachments = []) => {
      const text = String(rawText ?? "").trim();
      const files = Array.isArray(attachments) ? attachments : [];
      if ((!text && !files.length) || sending) return;

      setError(null);
      setLastFailed(null);
      setSending(true);
      const pendingId = `pending-${Date.now()}`;
      // The optimistic bubble shows the local previews; the server's copy
      // replaces it once the reply lands.
      setMessages((prev) => [...prev, { id: pendingId, role: "user", text, attachments: files }]);

      try {
        const result = await callAction(sendMessage({ chatId, text, attachments: toPayload(files) }));
        const id = result.chat.id;
        // Keep the full-size local previews for this turn; the server hands
        // back thumbnails, which are what later visits will show.
        const [userMessage, ...rest] = result.messages;
        const withPreviews = userMessage
          ? {
              ...userMessage,
              attachments: (userMessage.attachments || []).map((a, i) => ({
                ...a,
                previewUrl: files[i]?.previewUrl ?? a.previewUrl,
              })),
            }
          : userMessage;
        const incoming = userMessage ? [withPreviews, ...rest] : result.messages;
        setMessages((prev) => {
          const next = [...prev.filter((m) => m.id !== pendingId), ...incoming];
          transcripts.set(id, { title: result.chat.title, messages: next });
          return next;
        });
        setTitle(result.chat.title);
        if (result.created) {
          setChatId(id);
          setLoadedFor(id);
          onChatCreated?.(result.chat);
        } else {
          onChatTouched?.(result.chat);
        }
      } catch (err) {
        setError(err.message);
        setLastFailed({ text, attachments: files });
        setMessages((prev) => prev.filter((m) => m.id !== pendingId));
      } finally {
        setSending(false);
      }
    },
    [chatId, onChatCreated, onChatTouched, sending]
  );

  const retry = useCallback(() => {
    if (lastFailed) send(lastFailed.text, lastFailed.attachments);
  }, [lastFailed, send]);

  /** Forget the current thread locally so the next send starts a new one. */
  const reset = useCallback(() => {
    setChatId(null);
    setMessages([]);
    setTitle("");
    setLoadedFor(null);
    setError(null);
    setLastFailed(null);
  }, []);

  return { chatId, title, messages, loading, sending, error, lastFailed, send, retry, reset };
}

export default useChatSession;
