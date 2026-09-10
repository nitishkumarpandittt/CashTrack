"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, MessageSquare, Pencil, Plus, Trash2, X } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const DAY = 24 * 60 * 60 * 1000;

/** Buckets like every chat app: Today, Yesterday, Previous 7 days, Older. */
function groupByRecency(chats) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const buckets = [
    { label: "Today", items: [] },
    { label: "Yesterday", items: [] },
    { label: "Previous 7 days", items: [] },
    { label: "Older", items: [] },
  ];
  for (const chat of chats) {
    const t = new Date(chat.updatedAt).getTime();
    const index = t >= startOfToday ? 0 : t >= startOfToday - DAY ? 1 : t >= startOfToday - 7 * DAY ? 2 : 3;
    buckets[index].items.push(chat);
  }
  return buckets.filter((b) => b.items.length);
}

function ChatRow({ chat, active, onSelect, onRename, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(chat.title);

  const commit = () => {
    const next = draft.trim();
    setEditing(false);
    if (next && next !== chat.title) onRename(chat.id, next);
    else setDraft(chat.title);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 rounded-xl bg-[var(--cash-mist)] px-2 py-1.5">
        <input
          value={draft}
          autoFocus
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") commit();
            if (event.key === "Escape") {
              setDraft(chat.title);
              setEditing(false);
            }
          }}
          aria-label="Conversation title"
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-[var(--cash-ink)] outline-none"
        />
        <button type="button" onClick={commit} aria-label="Save title" className="rounded-full p-1 text-[var(--cash-teal)] hover:bg-[var(--cash-wash)]">
          <Check className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => {
            setDraft(chat.title);
            setEditing(false);
          }}
          aria-label="Cancel"
          className="rounded-full p-1 text-[var(--cash-muted)] hover:bg-[var(--cash-wash)]"
        >
          <X className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div
      className={`group flex items-center gap-1 rounded-xl pr-1 transition-colors ${
        active ? "bg-[var(--cash-wash)]" : "hover:bg-[var(--cash-mist)]"
      }`}
    >
      <Link
        href={`/dashboard/assistant/${chat.id}`}
        onClick={onSelect}
        aria-current={active ? "page" : undefined}
        className={`flex min-w-0 flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] ${
          active ? "text-[var(--cash-teal)]" : "text-[var(--cash-ink)]"
        }`}
      >
        <MessageSquare className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
        <span className="truncate">{chat.title}</span>
      </Link>
      <div className={`flex shrink-0 items-center ${active ? "" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"}`}>
        <button
          type="button"
          onClick={() => setEditing(true)}
          aria-label={`Rename ${chat.title}`}
          className="rounded-full p-1.5 text-[var(--cash-muted)] hover:bg-[var(--cash-paper)] hover:text-[var(--cash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)]"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(chat)}
          aria-label={`Delete ${chat.title}`}
          className="rounded-full p-1.5 text-[var(--cash-muted)] hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 dark:hover:bg-rose-400/10 dark:hover:text-rose-300"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/**
 * The conversation rail. Rendering only; the workspace owns the data and
 * passes handlers down, so the same list works in the desktop column and the
 * mobile drawer.
 */
function ChatList({ chats, activeId, loading, error, onNew, onSelect, onRename, onDelete }) {
  const [pendingDelete, setPendingDelete] = useState(null);
  const groups = groupByRecency(chats);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-3 pb-3 pt-1">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-[var(--cash-line)] bg-[var(--cash-paper)] px-4 py-2.5 text-sm font-bold text-[var(--cash-ink)] shadow-sm transition-colors hover:border-[rgb(var(--cash-teal-rgb)/0.4)] hover:bg-[var(--cash-wash)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)]"
        >
          <Plus className="h-4 w-4 text-[var(--cash-teal)]" aria-hidden="true" />
          New chat
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        {loading ? (
          <div className="space-y-2 px-1 pt-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-9 animate-pulse rounded-xl bg-[var(--cash-mist)]" />
            ))}
          </div>
        ) : error ? (
          <p className="px-2 pt-2 text-xs leading-5 text-[var(--cash-muted)]">{error}</p>
        ) : groups.length === 0 ? (
          <p className="px-2 pt-2 text-xs leading-5 text-[var(--cash-muted)]">
            Your conversations will show up here.
          </p>
        ) : (
          groups.map((group) => (
            <section key={group.label} className="mb-4">
              <p className="px-3 pb-1.5 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cash-muted)]">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((chat) => (
                  <ChatRow
                    key={chat.id}
                    chat={chat}
                    active={chat.id === activeId}
                    onSelect={onSelect}
                    onRename={onRename}
                    onDelete={setPendingDelete}
                  />
                ))}
              </div>
            </section>
          ))
        )}
      </div>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="border-[var(--cash-line)] bg-[var(--cash-paper)]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-xl font-extrabold tracking-[-0.05em] text-[var(--cash-ink)]">
              Delete this conversation?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--cash-muted)]">
              &quot;{pendingDelete?.title}&quot; and its messages will be removed. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-full border-[var(--cash-line)]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const target = pendingDelete;
                setPendingDelete(null);
                if (target) onDelete(target.id);
              }}
              className="rounded-full bg-rose-500 text-white hover:bg-rose-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ChatList;
