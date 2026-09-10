"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { History, PanelLeftClose, PanelLeftOpen, Paperclip, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

import { deleteChat, listChats, renameChat } from "@/app/actions/chats";
import { callAction } from "@/utils/callAction";
import ChatComposer from "./ChatComposer";
import ChatList from "./ChatList";
import ChatMessages, { ErrorNotice } from "./ChatMessages";
import { forgetTranscript, useChatSession } from "./useChatSession";

const STARTERS = [
  {
    title: "Invest my surplus",
    prompt: "Where should I invest my surplus? Give me a plan with amounts.",
  },
  {
    title: "Emergency fund check",
    prompt: "Do I have enough of an emergency fund? How much should it be for me?",
  },
  {
    title: "Which budget needs attention",
    prompt: "Which of my budgets should I worry about, and what should I do about it?",
  },
  {
    title: "Teach me SIPs and index funds",
    prompt: "Explain SIPs and index funds simply, using my own numbers as the example.",
  },
];

const BASE = "/dashboard/assistant";

// The conversation list from earlier in this tab, so coming back to the
// assistant paints the rail immediately while a fresh copy loads behind it.
let chatListCache = null;

/**
 * The full-screen assistant: a conversation rail, a centred transcript and a
 * composer pinned to the bottom, the way every chat product lays it out.
 * `chatId` comes from the URL; null is a fresh, unsaved conversation.
 */
function ChatWorkspace({ chatId }) {
  const router = useRouter();
  const { user } = useUser();
  const firstName = user?.firstName || "";

  const [chats, setChats] = useState(() => chatListCache ?? []);
  const [chatsLoading, setChatsLoading] = useState(() => chatListCache === null);
  const [chatsError, setChatsError] = useState(null);
  const [railOpen, setRailOpen] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const scrollRef = useRef(null);
  const composerRef = useRef(null);

  const upsertChat = useCallback((chat) => {
    setChats((prev) => {
      const next = [chat, ...prev.filter((c) => c.id !== chat.id)];
      chatListCache = next;
      return next;
    });
  }, []);

  const onChatCreated = useCallback(
    (chat) => {
      upsertChat(chat);
      // Only the address bar needs to change. A router navigation would go
      // through the middleware and a server render for a page that renders
      // nothing, which was a visible pause after every first message.
      window.history.replaceState(window.history.state, "", `${BASE}/${chat.id}`);
    },
    [upsertChat]
  );

  const session = useChatSession({ chatId, onChatCreated, onChatTouched: upsertChat });
  const { messages, loading, sending, error, lastFailed, send, retry } = session;

  useEffect(() => {
    let cancelled = false;
    callAction(listChats())
      .then((rows) => {
        chatListCache = rows;
        if (!cancelled) setChats(rows);
      })
      .catch((err) => {
        if (!cancelled) setChatsError(err.message);
      })
      .finally(() => {
        if (!cancelled) setChatsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Keep the newest message in view as the thread grows.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, error]);

  // The drawer is closed by the handlers that change the conversation; this
  // only moves focus back to the box once the switch has happened.
  useEffect(() => {
    composerRef.current?.focus();
  }, [chatId]);

  // Pasting a screenshot anywhere on the page attaches it, unless the paste
  // is aimed at some other text field (the rename box in the rail, say).
  useEffect(() => {
    const onPaste = (event) => {
      const files = Array.from(event.clipboardData?.files || []);
      if (!files.length) return;
      const target = event.target;
      const inField = target instanceof HTMLElement && target.closest("input, [contenteditable='true']");
      if (inField) return;
      event.preventDefault();
      composerRef.current?.addFiles(files);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  // Drag state for the whole conversation pane. The counter survives the
  // dragenter/dragleave pairs fired by every child element crossed.
  const dragDepth = useRef(0);
  const [dropActive, setDropActive] = useState(false);

  const dragHandlers = {
    onDragEnter: (event) => {
      if (!event.dataTransfer?.types?.includes("Files")) return;
      event.preventDefault();
      dragDepth.current += 1;
      setDropActive(true);
    },
    onDragOver: (event) => {
      if (!event.dataTransfer?.types?.includes("Files")) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    },
    onDragLeave: () => {
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (dragDepth.current === 0) setDropActive(false);
    },
    onDrop: (event) => {
      if (!event.dataTransfer?.files?.length) return;
      event.preventDefault();
      dragDepth.current = 0;
      setDropActive(false);
      composerRef.current?.addFiles(event.dataTransfer.files);
    },
  };

  // The conversation on screen: the one in the URL, or the one the hook just
  // created before the address bar was updated in place.
  const activeId = session.chatId ?? chatId;

  const startNew = () => {
    setDrawerOpen(false);
    if (chatId) router.push(BASE);
    else {
      session.reset();
      window.history.replaceState(window.history.state, "", BASE);
    }
    composerRef.current?.focus();
  };

  const onRename = async (id, title) => {
    const previous = chats;
    setChats((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)));
    try {
      const updated = await callAction(renameChat(id, title));
      setChats((prev) => {
        const next = prev.map((c) => (c.id === id ? updated : c));
        chatListCache = next;
        return next;
      });
    } catch (err) {
      setChats(previous);
      toast.error("Could not rename the conversation", { description: err.message });
    }
  };

  const onDelete = async (id) => {
    const previous = chats;
    setChats((prev) => {
      const next = prev.filter((c) => c.id !== id);
      chatListCache = next;
      return next;
    });
    try {
      await callAction(deleteChat(id));
      forgetTranscript(id);
      if (id === activeId) {
        session.reset();
        if (chatId) router.replace(BASE);
        else window.history.replaceState(window.history.state, "", BASE);
      }
    } catch (err) {
      setChats(previous);
      toast.error("Could not delete the conversation", { description: err.message });
    }
  };

  const activeTitle = activeId ? session.title || chats.find((c) => c.id === activeId)?.title : "";
  const empty = !loading && messages.length === 0 && !sending;

  const rail = (
    <ChatList
      chats={chats}
      activeId={activeId}
      loading={chatsLoading}
      error={chatsError}
      onNew={startNew}
      onSelect={() => setDrawerOpen(false)}
      onRename={onRename}
      onDelete={onDelete}
    />
  );

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[var(--cash-mist)]">
      {/* Desktop rail */}
      <aside
        className={`hidden shrink-0 flex-col border-r border-[var(--cash-line)] bg-[rgb(var(--cash-paper-rgb)/0.6)] pt-3 transition-[width] duration-300 lg:flex ${
          railOpen ? "w-72" : "w-0 overflow-hidden border-r-0"
        }`}
        aria-label="Conversations"
        aria-hidden={!railOpen}
      >
        <div className="w-72">{rail}</div>
      </aside>

      {/* Mobile / tablet drawer */}
      {drawerOpen ? (
        <div className="lg:hidden">
          <button
            type="button"
            aria-label="Close conversations"
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 z-40 cursor-default bg-[rgb(var(--cash-onyx-rgb)/0.35)] backdrop-blur-sm"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Conversations"
            className="chat-panel-in fixed inset-y-0 left-0 z-50 flex w-[min(86vw,20rem)] flex-col bg-[var(--cash-paper)] pt-3 shadow-[var(--cash-shadow-preview)]"
          >
            <div className="flex items-center justify-between px-4 pb-2">
              <p className="font-display text-sm font-bold text-[var(--cash-ink)]">Conversations</p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close"
                className="rounded-full p-1.5 text-[var(--cash-muted)] hover:bg-[var(--cash-mist)]"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="min-h-0 flex-1">{rail}</div>
          </aside>
        </div>
      ) : null}

      {/* Thread */}
      <section className="relative flex min-w-0 flex-1 flex-col" {...dragHandlers}>
        {dropActive ? (
          <div
            className="pointer-events-none absolute inset-3 z-30 flex items-center justify-center rounded-[24px] border-2 border-dashed border-[var(--cash-teal)] bg-[rgb(var(--cash-wash-rgb)/0.85)] backdrop-blur-sm"
            aria-hidden="true"
          >
            <div className="flex items-center gap-3 rounded-full bg-[var(--cash-paper)] px-5 py-3 shadow-[var(--cash-shadow-card)]">
              <Paperclip className="h-5 w-5 text-[var(--cash-teal)]" aria-hidden="true" />
              <p className="font-display text-sm font-bold text-[var(--cash-ink)]">
                Drop to attach: images, PDFs, CSV or text
              </p>
            </div>
          </div>
        ) : null}
        <header className="flex items-center gap-2 border-b border-[var(--cash-line)] bg-[rgb(var(--cash-paper-rgb)/0.7)] px-3 py-2.5 backdrop-blur sm:px-5">
          <button
            type="button"
            onClick={() => setRailOpen((open) => !open)}
            aria-label={railOpen ? "Hide conversations" : "Show conversations"}
            className="hidden rounded-full p-2 text-[var(--cash-muted)] transition-colors hover:bg-[var(--cash-mist)] hover:text-[var(--cash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] lg:inline-flex"
          >
            {railOpen ? <PanelLeftClose className="h-5 w-5" aria-hidden="true" /> : <PanelLeftOpen className="h-5 w-5" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Show conversations"
            className="inline-flex rounded-full p-2 text-[var(--cash-muted)] transition-colors hover:bg-[var(--cash-mist)] hover:text-[var(--cash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] lg:hidden"
          >
            <History className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Image
              src="/cashtrack-icon-theme.svg"
              alt=""
              width={22}
              height={22}
              className="h-[22px] w-[22px] shrink-0 rounded-full"
              aria-hidden="true"
            />
            <h2 className="truncate font-display text-sm font-bold tracking-[-0.03em] text-[var(--cash-ink)] sm:text-base">
              {activeTitle || "New conversation"}
            </h2>
          </div>
        </header>

        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto" aria-live="polite">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
            {loading ? (
              <div className="space-y-4">
                <div className="ml-auto h-10 w-2/3 animate-pulse rounded-2xl bg-[var(--cash-wash)]" />
                <div className="h-24 w-5/6 animate-pulse rounded-2xl bg-[var(--cash-paper)]" />
                <div className="ml-auto h-10 w-1/2 animate-pulse rounded-2xl bg-[var(--cash-wash)]" />
                <div className="h-32 w-full animate-pulse rounded-2xl bg-[var(--cash-paper)]" />
              </div>
            ) : empty ? (
              <div className="flex min-h-[50vh] flex-col justify-end sm:min-h-[55vh]">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--cash-onyx)] text-[var(--cash-emerald)]">
                  <Sparkles className="h-6 w-6" aria-hidden="true" />
                </div>
                <h1 className="mt-5 font-display text-3xl font-extrabold leading-[1.02] tracking-[-0.07em] text-[var(--cash-ink)] sm:text-4xl">
                  {firstName ? `Hi ${firstName}, ` : "Hi, "}what&apos;s on your mind about money?
                </h1>
                <p className="mt-3 max-w-xl text-base leading-7 text-[var(--cash-muted)]">
                  Ask anything about investing, saving, debt or your budgets. Every answer is grounded
                  in the numbers you have recorded in CashTrack.
                </p>
                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {STARTERS.map((starter) => (
                    <button
                      key={starter.title}
                      type="button"
                      onClick={() => send(starter.prompt)}
                      className="rounded-2xl border border-[var(--cash-line)] bg-[var(--cash-paper)] px-4 py-3.5 text-left transition-colors hover:border-[rgb(var(--cash-teal-rgb)/0.4)] hover:bg-[var(--cash-wash)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)]"
                    >
                      <span className="block font-display text-sm font-bold tracking-[-0.02em] text-[var(--cash-ink)]">
                        {starter.title}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[var(--cash-muted)]">{starter.prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <ChatMessages messages={messages} sending={sending} size="lg" />
            )}

            {error ? (
              <div className="mt-4">
                <ErrorNotice error={error} onRetry={lastFailed ? retry : undefined} />
              </div>
            ) : null}
          </div>
        </div>

        <div className="border-t border-[var(--cash-line)] bg-[rgb(var(--cash-mist-rgb)/0.9)] px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6">
          <div className="mx-auto w-full max-w-3xl">
            <ChatComposer ref={composerRef} onSend={send} disabled={sending || loading} size="lg" autoFocus />
            <p className="mt-2 text-center text-[11px] leading-5 text-[var(--cash-muted)]">
              CashTrack AI gives general guidance from your own data. Verify before you act on it.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ChatWorkspace;
