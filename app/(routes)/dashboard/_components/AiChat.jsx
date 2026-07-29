"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { desc, eq, getTableColumns, sql } from "drizzle-orm";
import { Sparkles, ArrowUp, X, RotateCcw } from "lucide-react";

import { db } from "@/utils/dbConfig";
import { Budgets, Expenses, Incomes } from "@/utils/schema";
import { deriveInsights } from "@/utils/deriveInsights";

const STARTERS = [
  "Where is most of my money going?",
  "Am I saving enough?",
  "Which budget should I worry about?",
];

const rupees = (n) => `Rs.${Math.round(Number(n) || 0).toLocaleString("en-IN")}`;

/**
 * Compact, factual snapshot handed to the model. Kept small and explicit so
 * answers stay anchored to real figures instead of being invented.
 */
function buildContext({ budgets, incomes, expenses }) {
  const { totals } = deriveInsights({
    budgetList: budgets,
    incomeList: incomes,
    expensesList: expenses,
  });

  const lines = [
    `Total income: ${rupees(totals.totalIncome)}`,
    `Total budgeted: ${rupees(totals.totalBudget)}`,
    `Total spent: ${rupees(totals.totalSpend)}`,
    `Surplus: ${rupees(totals.surplus)}`,
    totals.savingsRate === null
      ? "Savings rate: not available (no income recorded)"
      : `Savings rate: ${totals.savingsRate.toFixed(1)}%`,
    "",
    "BUDGETS (name | limit | spent):",
    ...(budgets.length
      ? budgets.map(
          (b) => `- ${b.name} | ${rupees(b.amount)} | ${rupees(b.totalSpend)}`
        )
      : ["- none"]),
    "",
    "INCOME SOURCES (name | amount):",
    ...(incomes.length
      ? incomes.map((i) => `- ${i.name} | ${rupees(i.amount)}`)
      : ["- none"]),
    "",
    "RECENT EXPENSES (name | amount | date):",
    ...(expenses.length
      ? expenses
          .slice(0, 25)
          .map((e) => `- ${e.name} | ${rupees(e.amount)} | ${e.createdAt || "unknown"}`)
      : ["- none"]),
  ];

  return lines.join("\n");
}

/** Bold runs (**text**) inside a single line, without dangerouslySetInnerHTML. */
function renderInline(text) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={i} className="font-bold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        <span key={i}>{part}</span>
      )
    );
}

/**
 * Gemini answers arrive as light markdown (bold, `-`/`*` bullets). Rendering
 * the raw asterisks looks broken, so parse just those two constructs into
 * paragraphs and lists; anything else stays plain text.
 */
function AssistantText({ text }) {
  const blocks = [];
  let list = null;

  for (const line of text.split("\n")) {
    const bullet = line.match(/^\s*[*-]\s+(.*)/);
    if (bullet) {
      if (!list) {
        list = [];
        blocks.push({ type: "list", items: list });
      }
      list.push(bullet[1]);
    } else {
      list = null;
      if (line.trim()) blocks.push({ type: "p", text: line });
    }
  }

  return (
    <div className="space-y-2">
      {blocks.map((block, i) =>
        block.type === "list" ? (
          <ul key={i} className="space-y-1.5">
            {block.items.map((item, j) => (
              <li key={j} className="flex gap-2">
                <span
                  className="mt-[8px] h-1 w-1 shrink-0 rounded-full bg-[var(--cash-teal)]"
                  aria-hidden="true"
                />
                <span>{renderInline(item)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p key={i}>{renderInline(block.text)}</p>
        )
      )}
    </div>
  );
}

/**
 * Minimal assistant panel.
 *
 * variant="sidebar" (default): rendered inside the sidebar's middle section
 * (between the logo header and the account footer) and sized to fill it, so
 * it never covers the rest of the app.
 *
 * variant="sheet": a bottom sheet with a backdrop, for the mobile drawer
 * where there is no persistent sidebar to dock into.
 */
function AiChat({ open, onClose, variant = "sidebar" }) {
  const isSheet = variant === "sheet";
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [lastFailed, setLastFailed] = useState(null);
  const [context, setContext] = useState(null);
  const [closing, setClosing] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  const closeTimerRef = useRef(null);

  const contextLoading = open && context === null;

  // Closing plays the exit animation first; onClose (which unmounts the
  // panel) only fires once it has finished.
  const finishClose = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setClosing(false);
    onClose?.();
  }, [onClose]);

  const requestClose = useCallback(() => {
    if (closing) return;
    setClosing(true);
    // Fallback in case animationend never fires (e.g. animations disabled).
    closeTimerRef.current = setTimeout(finishClose, 320);
  }, [closing, finishClose]);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  // Load the user's figures once, the first time the panel is opened.
  useEffect(() => {
    if (!open || context !== null) return;
    const email = user?.primaryEmailAddress?.emailAddress;
    if (!email) return;

    let cancelled = false;
    (async () => {
      try {
        const [budgets, incomes, expenses] = await Promise.all([
          db
            .select({
              ...getTableColumns(Budgets),
              totalSpend: sql`coalesce(sum(${Expenses.amount}), 0)`.mapWith(Number),
            })
            .from(Budgets)
            .leftJoin(Expenses, eq(Budgets.id, Expenses.budgetId))
            .where(eq(Budgets.createdBy, email))
            .groupBy(Budgets.id),
          db.select().from(Incomes).where(eq(Incomes.createdBy, email)),
          db
            .select({
              name: Expenses.name,
              amount: Expenses.amount,
              createdAt: Expenses.createdAt,
            })
            .from(Expenses)
            .leftJoin(Budgets, eq(Budgets.id, Expenses.budgetId))
            .where(eq(Budgets.createdBy, email))
            .orderBy(desc(Expenses.id)),
        ]);
        if (!cancelled) setContext(buildContext({ budgets, incomes, expenses }));
      } catch (err) {
        console.error("Could not load context for chat:", err);
        if (!cancelled) setContext("");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, context, user?.primaryEmailAddress?.emailAddress]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending, error]);

  // Escape to dismiss.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") requestClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, requestClose]);

  const send = async (text) => {
    const question = (text ?? input).trim();
    if (!question || sending) return;

    setError(null);
    setLastFailed(null);
    setInput("");
    const history = messages;
    setMessages((prev) => [...prev, { role: "user", text: question }]);
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, history, context: context || "" }),
      });
      // `?? {}` also covers middleware responses whose body is literal null.
      const data = (await res.json().catch(() => ({}))) ?? {};

      if (!res.ok) {
        setError(data.error || "The assistant could not answer just now.");
        setLastFailed(question);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      }
    } catch {
      setError("Could not reach the assistant. Check your connection.");
      setLastFailed(question);
    } finally {
      setSending(false);
    }
  };

  const retry = () => {
    if (!lastFailed) return;
    // Drop the failed user message so it is not duplicated by the resend.
    setMessages((prev) => {
      const next = [...prev];
      if (next[next.length - 1]?.role === "user") next.pop();
      return next;
    });
    send(lastFailed);
  };

  const reset = () => {
    setMessages([]);
    setError(null);
    setLastFailed(null);
    inputRef.current?.focus();
  };

  if (!open) return null;

  return (
    <>
      {isSheet && (
        <button
          type="button"
          aria-label="Close assistant"
          onClick={requestClose}
          className={`fixed inset-0 z-[60] cursor-default bg-[var(--cash-ink)]/30 backdrop-blur-[2px] transition-opacity duration-200 ${
            closing ? "opacity-0" : "chat-backdrop-in"
          }`}
        />
      )}
    <div
      role="dialog"
      aria-modal={isSheet || undefined}
      aria-label="CashTrack AI assistant"
      className={`${closing ? "chat-panel-out" : "chat-panel-in"} ${
        isSheet
          ? "fixed inset-x-0 bottom-0 z-[70] h-[82dvh] rounded-t-[24px] border-t border-[var(--cash-line)] shadow-[var(--cash-shadow-preview)]"
          : "absolute -inset-x-5 top-0 -bottom-5 z-20"
      } flex flex-col overflow-hidden bg-white`}
      onAnimationEnd={(e) => {
        // Message bubbles animate too and their animationend bubbles up here,
        // so gate on the panel's own exit animation.
        if (e.animationName === "chat-panel-out") finishClose();
      }}
    >
      <header className="flex items-center gap-2 border-b border-[var(--cash-line)] bg-[var(--cash-mist)] px-4 py-3">
        <Sparkles className="h-4 w-4 shrink-0 text-[var(--cash-teal)]" aria-hidden="true" />
        <p className="font-display text-sm font-bold tracking-[-0.03em] text-[var(--cash-ink)]">
          CashTrack AI
        </p>
        <div className="ml-auto flex items-center">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              aria-label="Start a new chat"
              title="New chat"
              className="rounded-full p-1.5 text-[var(--cash-muted)] transition-colors hover:bg-[var(--cash-mist)] hover:text-[var(--cash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)]"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
          <button
            type="button"
            onClick={requestClose}
            aria-label="Close"
            className="rounded-full p-1.5 text-[var(--cash-muted)] transition-colors hover:bg-[var(--cash-mist)] hover:text-[var(--cash-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div
        ref={scrollRef}
        aria-live="polite"
        className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-col justify-end">
            <p className="text-[13px] leading-5 text-[var(--cash-muted)]">
              Ask about your budgets, spending or savings. Answers come straight
              from your own numbers.
            </p>
            <div className="mt-4 space-y-1.5">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  disabled={contextLoading}
                  className="block w-full rounded-xl border border-[var(--cash-line)] px-3 py-2 text-left text-[13px] font-semibold text-[var(--cash-ink)] transition-colors hover:border-[var(--cash-teal)]/40 hover:bg-[var(--cash-wash)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] disabled:cursor-wait disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) =>
            m.role === "user" ? (
              <div key={`${m.role}-${i}`} className="chat-msg-in flex justify-end">
                <p className="max-w-[90%] whitespace-pre-wrap rounded-2xl rounded-br-md bg-[var(--cash-teal)] px-3 py-2 text-[13px] leading-5 text-white">
                  {m.text}
                </p>
              </div>
            ) : (
              <div key={`${m.role}-${i}`} className="chat-msg-in flex">
                <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-[var(--cash-mist)] px-3 py-2 text-[13px] leading-5 text-[var(--cash-ink)]">
                  <AssistantText text={m.text} />
                </div>
              </div>
            )
          )
        )}

        {sending ? (
          <div className="chat-msg-in flex">
            <p className="rounded-2xl rounded-bl-md bg-[var(--cash-mist)] px-3 py-2.5">
              <span className="sr-only">The assistant is thinking</span>
              <span className="inline-flex gap-1" aria-hidden="true">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--cash-teal)] [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--cash-teal)] [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[var(--cash-teal)]" />
              </span>
            </p>
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="chat-msg-in space-y-2 rounded-xl border border-rose-100 bg-rose-50/70 px-3 py-2.5"
          >
            <p className="text-[13px] leading-5 text-rose-700">{error}</p>
            {lastFailed ? (
              <button
                type="button"
                onClick={retry}
                className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
              >
                Try again
              </button>
            ) : null}
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-[var(--cash-line)] bg-[var(--cash-mist)] px-4 py-3"
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={contextLoading ? "Loading your numbers…" : "Ask about your money…"}
          aria-label="Your question"
          className="h-9 min-w-0 flex-1 rounded-full border border-[var(--cash-line)] bg-white px-3.5 text-[13px] text-[var(--cash-ink)] outline-none transition-colors placeholder:text-[var(--cash-muted)] focus:border-[var(--cash-teal)]"
        />
        <button
          type="submit"
          disabled={!input.trim() || sending || contextLoading}
          aria-label="Send"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--cash-teal)] text-white transition-colors hover:bg-[var(--cash-ink)] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
    </>
  );
}

export default AiChat;
