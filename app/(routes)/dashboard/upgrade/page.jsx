import React from "react";
import { ArrowRight, Check, Sparkles, ShieldCheck } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "20$",
    description: "A focused starting point for your financial rhythm.",
    features: ["10 users included", "2GB of storage", "Email support", "Help center access"],
    featured: false,
  },
  {
    name: "Pro",
    price: "30$",
    description: "More room for the people and context behind your money.",
    features: ["20 users included", "5GB of storage", "Email support", "Help center access", "Phone support", "Community access"],
    featured: true,
  },
];

function Upgrade() {
  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-7 sm:px-6 md:px-8 md:py-12">
      <div className="mx-auto max-w-2xl text-center">
        <p className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--cash-teal)]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Choose your pace
        </p>
        <h1 className="mt-4 font-display text-4xl font-extrabold tracking-[-0.08em] text-[var(--cash-ink)] sm:text-6xl">
          More clarity when you need it.
        </h1>
        <p className="mt-5 text-base leading-7 text-[var(--cash-muted)]">
          Pick the plan that gives your financial workspace the right amount of room.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 items-stretch gap-5 lg:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`relative flex flex-col rounded-[28px] border p-6 shadow-[var(--cash-shadow-card)] sm:p-8 ${
              plan.featured
                ? "border-[var(--cash-teal)] bg-[var(--cash-onyx)] text-white"
                : "border-[var(--cash-line)] bg-[var(--cash-paper)] text-[var(--cash-ink)]"
            }`}
          >
            {plan.featured && (
              <div className="absolute right-6 top-6 rounded-full bg-[var(--cash-emerald)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--cash-onyx)]">
                Recommended
              </div>
            )}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${plan.featured ? "bg-white/10 text-[var(--cash-emerald)]" : "bg-[var(--cash-wash)] text-[var(--cash-teal)]"}`}>
                  {plan.featured ? <ShieldCheck className="h-5 w-5" aria-hidden="true" /> : <Sparkles className="h-5 w-5" aria-hidden="true" />}
                </div>
                <h2 className="mt-6 font-display text-2xl font-extrabold tracking-[-0.06em]">{plan.name}</h2>
                <p className={`mt-2 max-w-sm text-sm leading-6 ${plan.featured ? "text-white/60" : "text-[var(--cash-muted)]"}`}>{plan.description}</p>
              </div>
            </div>

            <p className="mt-8 flex items-baseline gap-2 border-b border-current/10 pb-7">
              <strong className="font-display text-5xl font-extrabold tracking-[-0.08em]">{plan.price}</strong>
              <span className={`text-sm ${plan.featured ? "text-white/60" : "text-[var(--cash-muted)]"}`}>/month</span>
            </p>

            <ul className="mt-7 flex-1 space-y-4">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 text-sm">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${plan.featured ? "bg-[var(--cash-emerald)] text-[var(--cash-onyx)]" : "bg-[var(--cash-wash)] text-[var(--cash-teal)]"}`}>
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                  <span className={plan.featured ? "text-white/80" : "text-[var(--cash-muted)]"}>{feature}</span>
                </li>
              ))}
            </ul>

            <a
              href="#"
              className={`mt-10 inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] focus-visible:ring-offset-2 ${
                plan.featured
                  ? "bg-[var(--cash-emerald)] text-[var(--cash-onyx)] hover:bg-white"
                  : "border border-[var(--cash-teal)] text-[var(--cash-teal)] hover:bg-[var(--cash-teal-solid)] hover:text-white"
              }`}
            >
              Get Started
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}

export default Upgrade;
