"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { ArrowUp, FileText, Loader2, Paperclip, Plus, X } from "lucide-react";
import { toast } from "sonner";

import { ACCEPT, MAX_ATTACHMENTS, formatBytes } from "@/utils/attachments";
import { prepareAttachments } from "@/utils/attachmentsClient";

function AttachmentChip({ file, onRemove, large }) {
  const remove = (
    <button
      type="button"
      onClick={() => onRemove(file.id)}
      aria-label={`Remove ${file.name}`}
      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--cash-onyx)] text-white shadow-sm transition-colors hover:bg-rose-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)]"
    >
      <X className="h-3 w-3" aria-hidden="true" />
    </button>
  );

  if (file.kind === "image") {
    return (
      <div className="relative shrink-0">
        {/* Plain img: the source is an in-memory data URL, not an asset next/image can optimise. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={file.previewUrl}
          alt={file.name}
          className={`${large ? "h-16 w-16" : "h-12 w-12"} rounded-xl border border-[var(--cash-line)] object-cover`}
        />
        {remove}
      </div>
    );
  }

  return (
    <div
      className={`relative flex shrink-0 items-center gap-2 rounded-xl border border-[var(--cash-line)] bg-[var(--cash-mist)] pr-3 ${
        large ? "h-16 pl-3" : "h-12 pl-2.5"
      }`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--cash-wash)] text-[var(--cash-teal)]">
        <FileText className="h-4 w-4" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block max-w-[9rem] truncate text-xs font-semibold text-[var(--cash-ink)]">{file.name}</span>
        <span className="block text-[10px] uppercase tracking-[0.08em] text-[var(--cash-muted)]">
          {file.kind === "pdf" ? "PDF" : "Text"} · {formatBytes(file.size)}
        </span>
      </span>
      {remove}
    </div>
  );
}

/**
 * The message box. Enter sends, Shift+Enter adds a line, the textarea grows
 * with the draft, and the plus button (or pasting / dropping a file) attaches
 * images, PDFs and text files that the coach reads along with the message.
 */
const ChatComposer = forwardRef(function ChatComposer(
  { onSend, disabled = false, placeholder = "Ask about your money…", autoFocus = false, size = "md" },
  ref
) {
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [preparing, setPreparing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const large = size === "lg";

  const resize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, large ? 200 : 120)}px`;
  };

  const addFiles = async (files) => {
    if (!files?.length) return;
    setPreparing(true);
    try {
      const { accepted, rejected } = await prepareAttachments(files, attachments);
      if (accepted.length) setAttachments((prev) => [...prev, ...accepted]);
      for (const reason of rejected) toast.error("File not attached", { description: reason });
    } finally {
      setPreparing(false);
      textareaRef.current?.focus();
    }
  };

  const removeFile = (id) => setAttachments((prev) => prev.filter((file) => file.id !== id));

  // Parents (the full-screen workspace, the sidebar panel) forward files that
  // were dropped or pasted anywhere in their area, not just on this box.
  useImperativeHandle(ref, () => ({
    focus: () => textareaRef.current?.focus(),
    addFiles,
  }));

  const canSend = (draft.trim() || attachments.length > 0) && !disabled && !preparing;

  const submit = () => {
    if (!canSend) return;
    onSend(draft.trim(), attachments);
    setDraft("");
    setAttachments([]);
    requestAnimationFrame(() => {
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    });
  };

  const atLimit = attachments.length >= MAX_ATTACHMENTS;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      onDragOver={(event) => {
        if (event.dataTransfer?.types?.includes("Files")) {
          event.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        if (!event.dataTransfer?.files?.length) return;
        event.preventDefault();
        setDragging(false);
        addFiles(event.dataTransfer.files);
      }}
      className={`rounded-[22px] border bg-[var(--cash-paper)] shadow-[var(--cash-shadow-card)] transition-colors focus-within:border-[var(--cash-teal)] ${
        dragging ? "border-[var(--cash-teal)] bg-[var(--cash-wash)]" : "border-[var(--cash-line)]"
      } ${large ? "px-3 py-2 sm:px-4" : "px-2.5 py-1.5"}`}
    >
      {attachments.length > 0 ? (
        <div className={`flex flex-wrap gap-3 ${large ? "px-1 pb-2 pt-2" : "px-1 pb-1.5 pt-1.5"}`}>
          {attachments.map((file) => (
            <AttachmentChip key={file.id} file={file} onRemove={removeFile} large={large} />
          ))}
        </div>
      ) : null}

      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ACCEPT}
          className="sr-only"
          tabIndex={-1}
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || preparing || atLimit}
          aria-label={atLimit ? `At most ${MAX_ATTACHMENTS} files per message` : "Attach an image, PDF or text file"}
          title={atLimit ? `At most ${MAX_ATTACHMENTS} files per message` : "Attach a file"}
          className={`flex shrink-0 items-center justify-center rounded-full border border-[var(--cash-line)] bg-[var(--cash-mist)] text-[var(--cash-muted)] transition-colors hover:border-[rgb(var(--cash-teal-rgb)/0.5)] hover:text-[var(--cash-teal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] disabled:cursor-not-allowed disabled:opacity-40 ${
            large ? "mb-1 h-10 w-10" : "mb-0.5 h-8 w-8"
          }`}
        >
          {preparing ? (
            <Loader2 className={`animate-spin ${large ? "h-5 w-5" : "h-4 w-4"}`} aria-hidden="true" />
          ) : (
            <Plus className={large ? "h-5 w-5" : "h-4 w-4"} aria-hidden="true" />
          )}
        </button>

        <textarea
          ref={textareaRef}
          value={draft}
          rows={1}
          autoFocus={autoFocus}
          onChange={(event) => {
            setDraft(event.target.value);
            resize();
          }}
          onPaste={(event) => {
            const files = Array.from(event.clipboardData?.files || []);
            if (files.length) {
              event.preventDefault();
              addFiles(files);
            }
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              submit();
            }
          }}
          placeholder={attachments.length ? "Add a question about the file, or just send it…" : placeholder}
          aria-label="Your message"
          className={`max-h-[200px] min-w-0 flex-1 resize-none bg-transparent leading-6 text-[var(--cash-ink)] outline-none placeholder:text-[var(--cash-muted)] ${
            large ? "py-2 text-base sm:text-[15px]" : "py-1.5 text-[13px]"
          }`}
        />

        <button
          type="submit"
          disabled={!canSend}
          aria-label="Send"
          className={`flex shrink-0 items-center justify-center rounded-full bg-[var(--cash-teal-solid)] text-white transition-colors hover:bg-[var(--cash-onyx)] disabled:cursor-not-allowed disabled:opacity-40 ${
            large ? "mb-1 h-10 w-10" : "mb-0.5 h-8 w-8"
          }`}
        >
          {attachments.length && !draft.trim() ? (
            <Paperclip className={large ? "h-5 w-5" : "h-4 w-4"} aria-hidden="true" />
          ) : (
            <ArrowUp className={large ? "h-5 w-5" : "h-4 w-4"} aria-hidden="true" />
          )}
        </button>
      </div>
    </form>
  );
});

export default ChatComposer;
