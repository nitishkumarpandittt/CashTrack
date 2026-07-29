import Image from "next/image";
import Link from "next/link";

function AuthShell({ children }) {
  return (
    <main className="min-h-screen bg-[var(--cash-mist)] px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-[1280px] overflow-hidden rounded-[32px] border border-[var(--cash-line)] bg-[var(--cash-paper)] shadow-[var(--cash-shadow-preview)] sm:min-h-[calc(100vh-3rem)] lg:grid-cols-[0.92fr_1.08fr]">
        <section className="relative hidden overflow-hidden bg-[var(--cash-onyx)] p-8 text-white lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full border-[38px] border-[rgb(var(--cash-teal-rgb)/0.35)]" aria-hidden="true" />

          <Link href="/" className="relative z-10 flex items-center gap-3" aria-label="CashTrack home">
            <Image src="/cashtrack-icon-theme.svg" alt="" width={42} height={42} priority className="h-[42px] w-[42px] shrink-0" />
            <span className="font-display text-xl font-extrabold tracking-[-0.06em]">CashTrack</span>
          </Link>

          <div className="relative z-10 max-w-md">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--cash-emerald)]">A clearer financial home</p>
            <h1 className="mt-6 font-display text-5xl font-extrabold leading-[0.96] tracking-[-0.08em] xl:text-6xl">
              Make money feel manageable.
            </h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-white/65">
              Your budgets, expenses, and the next best money move — together in
              one calm, focused view.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-display text-2xl font-extrabold tracking-[-0.06em]">01</p>
              <p className="mt-1 text-xs text-white/55">view for every account</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="font-display text-2xl font-extrabold tracking-[-0.06em]">24/7</p>
              <p className="mt-1 text-xs text-white/55">clarity when it matters</p>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center bg-[var(--cash-paper)] px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md">
            <Link href="/" className="mb-10 flex items-center gap-3 lg:hidden" aria-label="CashTrack home">
              <Image src="/cashtrack-icon-theme.svg" alt="" width={38} height={38} priority className="h-[38px] w-[38px] shrink-0" />
              <span className="font-display text-xl font-extrabold tracking-[-0.06em] text-[var(--cash-ink)]">CashTrack</span>
            </Link>
            {children}
          </div>
        </section>
      </div>
    </main>
  );
}

export default AuthShell;
