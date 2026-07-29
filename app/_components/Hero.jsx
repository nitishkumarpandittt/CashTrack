"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Check,
  LockKeyhole,
  Sparkles,
  WalletCards,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import FinancePreview from "./FinancePreview";
import HeroFluidBackground from "./HeroFluidBackground";
import Reveal from "./motion/Reveal";
import LineMask from "./motion/LineMask";
import MaskLines from "./motion/MaskLines";
import Counter from "./motion/Counter";
import Scrub from "./motion/Scrub";
import Accordion from "./motion/Accordion";

const highlights = [
  {
    icon: WalletCards,
    title: "Everything in one view",
    description: "Budgets, spending, and income without the spreadsheet sprawl.",
  },
  {
    icon: Sparkles,
    title: "Advice that gets you",
    description: "Clear next steps based on the way you actually spend.",
  },
  {
    icon: BarChart3,
    title: "Progress you can feel",
    description: "Simple signals that make better money habits stick.",
  },
];

const steps = [
  {
    number: "01",
    title: "Bring your money together",
    description: "Add your accounts, income, and recurring expenses to create one calm financial home.",
  },
  {
    number: "02",
    title: "Set the rules that matter",
    description: "Create budgets around your real priorities, from everyday spending to the goals ahead.",
  },
  {
    number: "03",
    title: "Let clarity do the work",
    description: "Use your dashboard and AI insights to spot patterns, make decisions, and keep moving.",
  },
];

// Counted stat rail. Rendered output is identical to the previous static
// strings ("01", "04", "24/7", "0") — only the count-up is new.
const stats = [
  { value: 1, pad: 2, suffix: "", label: "view for every account" },
  { value: 4, pad: 2, suffix: "", label: "signals that guide you" },
  { value: 24, pad: 0, suffix: "/7", label: "clarity when it matters" },
  { value: 0, pad: 0, suffix: "", label: "guesswork in the next step" },
];

const faqs = [
  {
    question: "What can I track with CashTrack?",
    answer: "CashTrack brings budgets, expenses, income, and spending patterns into one focused dashboard so you can see the full picture at a glance.",
  },
  {
    question: "How does the AI financial advice work?",
    answer: "The advisor turns your activity into practical, plain-language suggestions. It highlights patterns and gives you a next step instead of another chart to decode.",
  },
  {
    question: "Is my financial information secure?",
    answer: "Your account is protected by the authentication and data infrastructure already powering the app. CashTrack is designed to keep your financial overview private and focused on you.",
  },
  {
    question: "Can I start for free?",
    answer: "Yes. Start with the core CashTrack experience and build your financial rhythm before deciding what you need next.",
  },
];

function SectionLabel({ children }) {
  return (
    <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.24em] text-[var(--cash-teal)]">
      <span className="h-px w-8 bg-[var(--cash-teal)]" aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

function Hero() {
  return (
    <main className="overflow-hidden bg-[var(--cash-mist)] text-[var(--cash-ink)]">
      <section id="hero" className="relative isolate px-4 pb-24 pt-36 sm:px-6 sm:pb-32 sm:pt-">
        {/* Fluid field sits behind the grid so the grid still reads over it. */}
        <HeroFluidBackground />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(rgba(15,22,32,0.035)_1px,transparent_1px),linear-gradient(90deg,rgba(15,22,32,0.035)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]" aria-hidden="true" />
        <div className="pointer-events-none absolute right-[8%] top-40 -z-10 h-40 w-40 rounded-full border border-[var(--cash-line)] bg-[var(--cash-wash)]/60 blur-[1px]" aria-hidden="true" />

        <div className="mx-auto max-w-[1240px]">
          <div className="grid items-center gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div className="max-w-[600px]">
              {/* Hero is above the fold: these play on the intro gate, not on scroll. */}
              <MaskLines delay={0.05} immediate>
                <h1 className="max-w-[650px] font-display text-[clamp(3.5rem,7vw,6.8rem)] font-extrabold leading-[0.9] tracking-[-0.085em] text-[var(--cash-ink)]">
                  <span className="line-mask">
                    <span className="line-mask__inner">Spend with</span>
                  </span>
                  <span className="line-mask">
                    <span className="line-mask__inner text-[var(--cash-teal)]">intention.</span>
                  </span>
                  {/* .line-mask's 0.22em bottom padding also clears the sand underline. */}
                  <span className="line-mask">
                    <span className="line-mask__inner">
                      Live with{" "}
                      <span className="relative inline-block">
                        <span className="relative z-10">momentum.</span>
                        <span className="absolute -bottom-1 left-0 right-0 -z-0 h-3 rounded-full bg-[var(--cash-sand)]/70 sm:h-4" aria-hidden="true" />
                      </span>
                    </span>
                  </span>
                </h1>
              </MaskLines>

              <Reveal delay={0.35} immediate>
                <p className="mt-7 max-w-[510px] text-lg leading-8 text-[var(--cash-muted)] sm:text-xl">
                  CashTrack brings your budgets, expenses, and the next best money move into one calm, intelligent view.
                </p>
              </Reveal>

              <Reveal delay={0.45} immediate>
                <div className="mt-9 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                  <Button asChild size="lg" className="h-14 rounded-full bg-[var(--cash-teal)] px-7 text-base text-white shadow-[var(--cash-shadow-button)] hover:-translate-y-0.5 hover:bg-[var(--cash-ink)]">
                    <Link href="/dashboard" data-cursor="Start">
                      Start tracking free
                      <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </Link>
                  </Button>
                  <a href="#how-it-works" className="group inline-flex items-center rounded-full px-4 py-3 text-sm font-bold text-[var(--cash-ink)] transition-colors hover:text-[var(--cash-teal)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)]">
                    See how it works
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                  </a>
                </div>
              </Reveal>

              <Reveal delay={0.55} immediate>
                <div className="mt-10 flex flex-wrap gap-x-5 gap-y-2 text-xs font-semibold text-[var(--cash-muted)]">
                  {['No spreadsheets', 'Actionable AI insights', 'Built for real life'].map((item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-[var(--cash-teal)]" aria-hidden="true" />
                      {item}
                    </span>
                  ))}
                </div>
              </Reveal>
            </div>

            <Reveal delay={0.3} immediate className="lg:pt-12">
              {/* Hero media: scrub: true — locked 1:1 to the scrollbar. */}
              <Scrub from={{ y: 0 }} to={{ y: -46 }} scrub start="top bottom" end="bottom top">
                <FinancePreview />
              </Scrub>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="border-y border-[var(--cash-line)] bg-white/55 px-4 py-9 sm:px-6">
        {/* 2x2 on mobile/tablet, one row on md+. Dividers and edge padding are
            set per cell — a plain divide-x puts a stray border and indent on
            the second mobile row. */}
        <div className="mx-auto grid max-w-[1240px] grid-cols-2 gap-y-6 md:grid-cols-4 md:gap-y-0">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`py-2 ${
                [
                  "pr-4 sm:pr-7",
                  "border-l border-[var(--cash-line)] px-4 sm:px-7",
                  "pr-4 sm:pr-7 md:border-l md:border-[var(--cash-line)] md:pl-7",
                  "border-l border-[var(--cash-line)] pl-4 sm:pl-7",
                ][i]
              }`}
            >
              <p className="font-display text-2xl font-extrabold tracking-[-0.07em] text-[var(--cash-ink)] sm:text-3xl">
                <Counter value={stat.value} pad={stat.pad} suffix={stat.suffix} />
              </p>
              <p className="mt-1 max-w-[130px] text-xs leading-4 text-[var(--cash-muted)] sm:text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <div className="max-w-[690px]">
              <SectionLabel>Built around your real life</SectionLabel>
              <LineMask
                className="mt-6 max-w-[650px] font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.07em] sm:text-6xl"
                text="The calm side of money management."
              />
              <p className="mt-6 max-w-[560px] text-lg leading-8 text-[var(--cash-muted)]">
                Good financial tools should give you confidence, not another dashboard to babysit. CashTrack keeps the important parts close and the noise out of the way.
              </p>
            </div>
          </Reveal>

          <div className="mt-14 grid gap-4 md:grid-cols-12 md:grid-rows-2">
            <Reveal className="md:col-span-5 md:row-span-2" delay={0.05}>
              <article className="group relative flex h-full min-h-[430px] flex-col justify-between overflow-hidden rounded-[28px] bg-[var(--cash-teal)] p-7 text-white shadow-[var(--cash-shadow-card)] transition-transform duration-500 hover:-translate-y-1 sm:p-9">
                <div className="relative z-10 flex items-center justify-between">
                  <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">Core signal</span>
                  <Sparkles className="h-5 w-5 text-[var(--cash-sand)]" aria-hidden="true" />
                </div>
                <div className="relative z-10">
                  <h3 className="max-w-[370px] font-display text-4xl font-bold leading-[0.98] tracking-[-0.07em] sm:text-5xl">Know what your money is trying to tell you.</h3>
                  <p className="mt-5 max-w-[350px] text-sm leading-6 text-white/75">AI-powered summaries turn messy activity into a simple, useful next move.</p>
                  <a href="#how-it-works" className="mt-8 inline-flex items-center text-sm font-bold text-white transition-colors hover:text-[var(--cash-sand)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white">
                    Explore the rhythm <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </a>
                </div>
                <div className="pointer-events-none absolute -bottom-20 -right-16 h-64 w-64 rounded-full border-[36px] border-white/10 transition-transform duration-500 group-hover:scale-110" aria-hidden="true" />
              </article>
            </Reveal>

            <Reveal className="md:col-span-7" delay={0.1}>
              <article className="flex h-full min-h-[205px] items-end justify-between gap-6 rounded-[28px] border border-[var(--cash-line)] bg-white p-7 shadow-[var(--cash-shadow-card)] transition-transform duration-500 hover:-translate-y-1 sm:p-9">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cash-teal)]">Less admin</p>
                  <h3 className="mt-4 max-w-[420px] font-display text-3xl font-bold leading-tight tracking-[-0.06em]">Budgets that flex with the month.</h3>
                  <p className="mt-3 max-w-[430px] text-sm leading-6 text-[var(--cash-muted)]">See what is left, what changed, and where to adjust before a small leak becomes a big one.</p>
                </div>
                <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--cash-wash)] text-[var(--cash-teal)] sm:flex"><WalletCards className="h-7 w-7" aria-hidden="true" /></div>
              </article>
            </Reveal>

            <Reveal className="md:col-span-7" delay={0.15}>
              <article className="flex h-full min-h-[205px] items-end justify-between gap-6 rounded-[28px] border border-[var(--cash-line)] bg-[var(--cash-ink)] p-7 text-white shadow-[var(--cash-shadow-card)] transition-transform duration-500 hover:-translate-y-1 sm:p-9">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--cash-emerald)]">Quiet confidence</p>
                  <h3 className="mt-4 max-w-[420px] font-display text-3xl font-bold leading-tight tracking-[-0.06em]">Your private financial cockpit.</h3>
                  <p className="mt-3 max-w-[430px] text-sm leading-6 text-white/60">A clean overview, secure sign-in, and the context you need to make decisions with less noise.</p>
                </div>
                <div className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-[var(--cash-emerald)] sm:flex"><LockKeyhole className="h-7 w-7" aria-hidden="true" /></div>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[var(--cash-line)] bg-white px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto max-w-[1240px]">
          <Reveal>
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div className="max-w-[650px]">
                <SectionLabel>How it works</SectionLabel>
                <LineMask
                  className="mt-6 font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.07em] sm:text-6xl"
                  text="A better money habit, in three moves."
                />
              </div>
              <p className="max-w-[300px] text-sm leading-6 text-[var(--cash-muted)]">Small inputs become a clearer picture. The picture becomes a better decision.</p>
            </div>
          </Reveal>

          <div className="relative mt-16 grid gap-10 md:grid-cols-3 md:gap-8">
            {/* Spans circle-centre to circle-centre. The circles are 48px and sit
                at the start of each of 3 columns with a 32px gap, so their centres
                are 24px in from the left and (columnWidth - 24px) in from the
                right, where columnWidth = (100% - 2*32px) / 3. The previous
                10%/10% inset was unrelated to the circles and overshot by 244px. */}
            <div
              className="pointer-events-none absolute left-6 right-[calc((100%_-_64px)/3_-_24px)] top-6 hidden border-t border-dashed border-[var(--cash-glaucous)]/40 md:block"
              aria-hidden="true"
            />
            {steps.map((step, index) => (
              <Reveal key={step.number} delay={index * 0.08}>
                {/* Stacked below md, so each step centers; the 3-column row
                    from md up stays left-aligned under the connector line. */}
                <article className="relative flex flex-col items-center text-center md:items-start md:text-left">
                  <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--cash-teal)] bg-white font-display text-sm font-extrabold text-[var(--cash-teal)] shadow-sm">{step.number}</div>
                  <h3 className="mt-7 max-w-[260px] font-display text-2xl font-bold leading-tight tracking-[-0.06em]">{step.title}</h3>
                  <p className="mt-3 max-w-[310px] text-sm leading-6 text-[var(--cash-muted)]">{step.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-24 sm:px-6 sm:py-32">
        <div className="mx-auto grid max-w-[1240px] items-start gap-12 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <SectionLabel>One less thing to worry about</SectionLabel>
            <LineMask
              className="mt-6 max-w-[480px] font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.07em] sm:text-6xl"
              text="Questions are part of the plan."
            />
            <p className="mt-6 max-w-[400px] text-lg leading-8 text-[var(--cash-muted)]">A little context can make a big decision feel much lighter.</p>
          </Reveal>

          <Reveal delay={0.08}>
            <Accordion id="faq" items={faqs} />
          </Reveal>
        </div>
      </section>

      <section className="px-4 pb-6 sm:px-6 sm:pb-8">
        <div className="relative mx-auto max-w-[1240px] overflow-hidden rounded-[32px] bg-[var(--cash-ink)] px-6 py-16 text-center text-white sm:px-10 sm:py-24">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full border-[42px] border-[var(--cash-teal)]/25" aria-hidden="true" />
          <Reveal>
            <div className="relative z-10 mx-auto max-w-[700px]">
              <LineMask
                className="font-display text-4xl font-extrabold leading-[0.98] tracking-[-0.07em] sm:text-6xl pt-6"
                text="Make your next money move a good one."
              />
              <p className="mx-auto mt-6 max-w-[520px] text-base leading-7 text-white/60 sm:text-lg">Set up your financial home today and let the small, smart decisions compound.</p>
              <Button asChild size="lg" className="mt-9 h-14 rounded-full bg-[var(--cash-emerald)] px-7 text-base font-bold text-[var(--cash-ink)] shadow-[var(--cash-shadow-button)] hover:bg-white">
                <Link href="/dashboard" data-cursor="Open"><span>Open CashTrack</span> <ArrowUpRight className="ml-2 h-4 w-4" aria-hidden="true" /></Link>
              </Button>
            </div>
          </Reveal>
        </div>
        <p className="mx-auto max-w-[1240px] px-1 pt-6 text-xs text-[var(--cash-muted)]">CashTrack · Your personal finance advisor · Make money feel manageable.</p>
      </section>
    </main>
  );
}

export default Hero;
