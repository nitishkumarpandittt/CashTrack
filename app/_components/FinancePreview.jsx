import Image from "next/image";
import { ArrowUpRight, Sparkles, TrendingUp } from "lucide-react";

function FinancePreview() {
  // Keeps the "live view" chip honest — a hardcoded month reads as a stale
  // screenshot the moment it passes.
  const month = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="relative mx-auto w-full max-w-[720px]">
      <div className="absolute -left-5 top-16 hidden w-44 -rotate-6 rounded-2xl border border-white/80 bg-white/90 p-3 shadow-[var(--cash-shadow-card)] backdrop-blur sm:block lg:-left-10">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cash-muted)]">
          <span>AI pulse</span>
          <Sparkles className="h-3.5 w-3.5 text-[var(--cash-teal)]" aria-hidden="true" />
        </div>
        <p className="mt-2 text-xs font-semibold leading-4 text-[var(--cash-ink)]">
          Your dining spend is 18% lower this month.
        </p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--cash-wash)]">
          <div className="h-full w-[68%] rounded-full bg-[var(--cash-emerald)]" />
        </div>
      </div>

      <div className="absolute -right-4 bottom-8 z-10 w-48 rotate-3 rounded-2xl border border-white/80 bg-[var(--cash-ink)] p-4 text-white shadow-[var(--cash-shadow-card)] sm:-right-8">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
          <TrendingUp className="h-3.5 w-3.5 text-[var(--cash-emerald)]" aria-hidden="true" />
          <span>On track</span>
        </div>
        <div className="mt-3 flex items-end justify-between gap-2">
          <p className="font-display text-2xl font-bold tracking-[-0.06em]">₹8,420</p>
          <span className="pb-1 text-xs text-[var(--cash-emerald)]">+12.4%</span>
        </div>
        <p className="mt-1 text-[11px] text-white/55">available after essentials</p>
      </div>

      <div className="relative overflow-hidden rounded-[28px] border border-white/90 bg-white p-2 shadow-[var(--cash-shadow-preview)] sm:rounded-[36px] sm:p-3">
        <div className="overflow-hidden rounded-[21px] border border-[var(--cash-line)] bg-[var(--cash-mist)] sm:rounded-[28px]">
          <div className="flex items-center justify-between border-b border-[var(--cash-line)] bg-white px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--cash-emerald)]" aria-hidden="true" />
              <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cash-muted)]">Live financial view</span>
            </div>
            <span className="rounded-full bg-[var(--cash-wash)] px-2 py-1 text-[10px] font-bold text-[var(--cash-teal)]">{month}</span>
          </div>
          <div className="relative aspect-[1.85/1] overflow-hidden bg-white">
            <Image
              src="/dashboard.png"
              alt="CashTrack dashboard overview with AI-generated financial signals and the CashTrack AI assistant"
              fill
              sizes="(max-width: 768px) 92vw, 680px"
              className="object-cover object-left-top"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[rgba(15,22,32,0.14)] to-transparent" aria-hidden="true" />
          </div>
        </div>
      </div>

      <div className="absolute -bottom-8 left-8 flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-3 py-2 text-[11px] font-semibold text-[var(--cash-ink)] shadow-[var(--cash-shadow-card)] backdrop-blur sm:left-16">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--cash-wash)] text-[var(--cash-teal)]">
          <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span>Less tracking. More living.</span>
      </div>
    </div>
  );
}

export default FinancePreview;
