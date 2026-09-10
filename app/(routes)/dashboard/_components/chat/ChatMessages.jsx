"use client";

import Image from "next/image";
import { FileText } from "lucide-react";

import AssistantText from "./AssistantText";
import { formatBytes } from "@/utils/attachments";

export function TypingDots() {
  return (
    <span className="inline-flex gap-1" aria-hidden="true">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--cash-teal)] [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--cash-teal)] [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--cash-teal)]" />
    </span>
  );
}

export function ErrorNotice({ error, onRetry, compact = false }) {
  return (
    <div
      role="alert"
      className={`chat-msg-in space-y-2 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 dark:border-rose-400/25 dark:bg-rose-400/10 ${
        compact ? "text-[13px]" : "text-sm"
      }`}
    >
      <p className="leading-6 text-rose-700 dark:text-rose-300">{error}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-full border border-rose-200 bg-[var(--cash-paper)] px-3 py-1 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:border-rose-400/30 dark:text-rose-300 dark:hover:bg-rose-400/20"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

/** The files a user sent with a message: image thumbnails and file chips. */
function MessageAttachments({ attachments, large }) {
  if (!attachments?.length) return null;
  return (
    <div className={`flex flex-wrap justify-end gap-2 ${large ? "max-w-[85%] sm:max-w-[75%]" : "max-w-[90%]"}`}>
      {attachments.map((file, index) =>
        file.kind === "image" && file.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={file.id ?? index}
            src={file.previewUrl}
            alt={file.name}
            className={`${large ? "max-h-56" : "max-h-32"} max-w-full rounded-2xl border border-[var(--cash-line)] object-cover`}
          />
        ) : (
          <span
            key={file.id ?? index}
            className="inline-flex items-center gap-2 rounded-xl border border-[var(--cash-line)] bg-[var(--cash-paper)] px-3 py-2 text-xs font-semibold text-[var(--cash-ink)]"
          >
            <FileText className="h-4 w-4 text-[var(--cash-teal)]" aria-hidden="true" />
            <span className="max-w-[12rem] truncate">{file.name}</span>
            <span className="text-[var(--cash-muted)]">{formatBytes(file.size)}</span>
          </span>
        )
      )}
    </div>
  );
}

const Mark = () => (
  <Image
    src="/cashtrack-icon-theme.svg"
    alt=""
    width={28}
    height={28}
    className="mt-1 h-7 w-7 shrink-0 rounded-full"
    aria-hidden="true"
  />
);

/**
 * The transcript. `size="lg"` is the full-screen workspace: wider bubbles, the
 * CashTrack mark beside each reply, roomier type. The default fits the sidebar.
 */
function ChatMessages({ messages, sending, size = "md" }) {
  const large = size === "lg";

  return (
    <div className={large ? "space-y-6" : "space-y-3"}>
      {messages.map((m) =>
        m.role === "user" ? (
          <div key={m.id} className="chat-msg-in flex flex-col items-end gap-2">
            <MessageAttachments attachments={m.attachments} large={large} />
            {m.text ? (
              <p
                className={`whitespace-pre-wrap rounded-2xl rounded-br-md bg-[var(--cash-teal-solid)] text-white ${
                  large
                    ? "max-w-[85%] px-4 py-2.5 text-[15px] leading-7 sm:max-w-[75%]"
                    : "max-w-[90%] px-3 py-2 text-[13px] leading-5"
                }`}
              >
                {m.text}
              </p>
            ) : null}
          </div>
        ) : (
          <div key={m.id} className={`chat-msg-in flex ${large ? "gap-3" : ""}`}>
            {large ? <Mark /> : null}
            <div
              className={
                large
                  ? "min-w-0 flex-1 text-[15px] leading-7 text-[var(--cash-ink)]"
                  : "max-w-[90%] rounded-2xl rounded-bl-md bg-[var(--cash-mist)] px-3 py-2 text-[13px] leading-5 text-[var(--cash-ink)]"
              }
            >
              <AssistantText text={m.text} />
            </div>
          </div>
        )
      )}

      {sending ? (
        <div className={`chat-msg-in flex ${large ? "gap-3" : ""}`}>
          {large ? <Mark /> : null}
          <p className={`rounded-2xl rounded-bl-md bg-[var(--cash-mist)] ${large ? "px-4 py-3" : "px-3 py-2.5"}`}>
            <span className="sr-only">CashTrack AI is thinking</span>
            <TypingDots />
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default ChatMessages;
