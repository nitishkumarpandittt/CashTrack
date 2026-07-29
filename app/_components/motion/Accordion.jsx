"use client";

import { useId, useRef, useState } from "react";
import { gsap } from "gsap";
import { ChevronDown } from "lucide-react";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { registerGsap, prefersReducedMotion } from "./MotionProvider";

/**
 * FAQ accordion animating height 0 <-> scrollHeight, per the brief.
 * Keeps the visual structure of the previous <details> markup while adding
 * proper button/region semantics so it stays keyboard accessible.
 */
function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const id = useId();

  const toggle = () => {
    registerGsap();
    const panel = panelRef.current;
    const next = !open;
    setOpen(next);

    if (!panel) return;

    if (prefersReducedMotion()) {
      panel.style.height = next ? "auto" : "0px";
      return;
    }

    gsap.killTweensOf(panel);

    if (next) {
      gsap.fromTo(
        panel,
        { height: 0 },
        {
          height: panel.scrollHeight,
          duration: 0.5,
          ease: "power3.out",
          onComplete: () => {
            panel.style.height = "auto";
            ScrollTrigger.refresh();
          },
        }
      );
    } else {
      gsap.fromTo(
        panel,
        { height: panel.scrollHeight },
        {
          height: 0,
          duration: 0.4,
          ease: "power3.inOut",
          onComplete: () => ScrollTrigger.refresh(),
        }
      );
    }
  };

  return (
    <div className="border-b border-[var(--cash-line)]">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={id}
        data-cursor={open ? "Close" : "Read"}
        className="flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left font-display text-lg font-bold tracking-[-0.04em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--cash-teal)] focus-visible:ring-offset-4 sm:text-xl"
      >
        {question}
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[var(--cash-teal)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      <div ref={panelRef} id={id} role="region" className="faq-panel">
        <p className="max-w-[650px] pb-6 pr-10 text-base leading-7 text-[var(--cash-muted)]">
          {answer}
        </p>
      </div>
    </div>
  );
}

function Accordion({ items, id }) {
  return (
    <div id={id} className="border-t border-[var(--cash-line)]">
      {items.map((item) => (
        <AccordionItem key={item.question} question={item.question} answer={item.answer} />
      ))}
    </div>
  );
}

export default Accordion;
