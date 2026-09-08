import Image from "next/image";
import Link from "next/link";

/**
 * Frame for the sign-in and sign-up screens.
 *
 * Phones and tablets get a compact dark brand banner above the form and the
 * form itself edge to edge, so nothing is squeezed inside a floating card.
 * From the lg breakpoint the banner grows into the full-height left column
 * and the whole thing sits in the rounded panel.
 */
function AuthShell({ children }) {
  return (
    <main className="min-h-[100dvh] bg-[var(--cash-mist)] lg:px-6 lg:py-6">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[1280px] flex-col overflow-hidden bg-[var(--cash-paper)] lg:grid lg:min-h-[calc(100dvh-3rem)] lg:grid-cols-[0.92fr_1.08fr] lg:rounded-[32px] lg:border lg:border-[var(--cash-line)] lg:shadow-[var(--cash-shadow-preview)]">
        <section className="relative overflow-hidden bg-[var(--cash-onyx)] px-5 pb-8 pt-[max(1.25rem,env(safe-area-inset-top))] text-white sm:px-8 sm:pb-10 lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div
            className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full border-[28px] border-[rgb(var(--cash-teal-rgb)/0.35)] lg:-right-24 lg:-top-24 lg:h-72 lg:w-72 lg:border-[38px]"
            aria-hidden="true"
          />

          <Link href="/" className="relative z-10 flex items-center gap-3" aria-label="CashTrack home">
            <Image src="/cashtrack-icon-theme.svg" alt="" width={42} height={42} priority className="h-9 w-9 shrink-0 lg:h-[42px] lg:w-[42px]" />
            <span className="font-display text-lg font-extrabold tracking-[-0.06em] lg:text-xl">CashTrack</span>
          </Link>

          <div className="relative z-10 mt-6 max-w-md lg:mt-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--cash-emerald)]">A clearer financial home</p>
            <h1 className="mt-3 font-display text-3xl font-extrabold leading-[0.98] tracking-[-0.07em] sm:text-4xl lg:mt-6 lg:text-5xl lg:leading-[0.96] lg:tracking-[-0.08em] xl:text-6xl">
              Make money feel manageable.
            </h1>
            <p className="mt-3 hidden max-w-sm text-base leading-7 text-white/65 sm:block lg:mt-6">
              Your budgets, expenses, and the next best money move — together in
              one calm, focused view.
            </p>
          </div>

          <div className="relative z-10 mt-6 hidden grid-cols-2 gap-3 md:grid lg:mt-0">
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

        <section className="flex flex-1 items-start justify-center px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 sm:items-center sm:px-10 sm:py-12 lg:px-14">
          <div className="w-full max-w-md">{children}</div>
        </section>
      </div>
    </main>
  );
}

export default AuthShell;
