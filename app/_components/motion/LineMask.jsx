"use client";

import { useRef } from "react";
import { gsap } from "gsap";

import { registerGsap, prefersReducedMotion } from "./MotionProvider";
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";
import { MASK_OFFSET } from "./mask-offset";

/**
 * Heading that measures its own wrapped lines, wraps each in an overflow
 * mask, then staggers them up from below.
 *
 * Text is rendered plainly on the server, so with JS off or reduced motion on
 * the heading is just a normal heading.
 */
function LineMask({ as: Tag = "h2", text, className = "", delay = 0, stagger = 0.09 }) {
  const ref = useRef(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) return undefined;

    let tween = null;
    let frame = 0;

    const clear = () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
      tween = null;
    };

    const build = () => {
      clear();
      el.textContent = text;

      // 1. Lay every word out as inline-block so each has its own offsetTop.
      const words = text.split(/\s+/).filter(Boolean);
      if (!words.length) return;

      el.textContent = "";
      const nodes = words.map((word, index) => {
        const span = document.createElement("span");
        span.textContent = word;
        span.style.display = "inline-block";
        el.appendChild(span);
        if (index < words.length - 1) el.appendChild(document.createTextNode(" "));
        return span;
      });

      // 2. Group words that share a baseline into lines.
      const lines = [];
      let current = null;
      nodes.forEach((node) => {
        const top = node.offsetTop;
        if (!current || Math.abs(current.top - top) > 1) {
          current = { top, words: [] };
          lines.push(current);
        }
        current.words.push(node.textContent);
      });

      // 3. Rebuild as masked lines.
      el.textContent = "";
      const inners = lines.map((line) => {
        const mask = document.createElement("span");
        mask.className = "line-mask";
        const inner = document.createElement("span");
        inner.className = "line-mask__inner";
        inner.textContent = line.words.join(" ");
        mask.appendChild(inner);
        el.appendChild(mask);
        return inner;
      });

      tween = gsap.fromTo(
        inners,
        { yPercent: MASK_OFFSET },
        {
          yPercent: 0,
          duration: 0.9,
          delay,
          stagger,
          ease: "power4.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }
      );
    };

    build();

    // Re-split when the heading's width changes (clamp() type reflows a lot).
    let lastWidth = el.offsetWidth;
    const observer = new ResizeObserver(() => {
      if (el.offsetWidth === lastWidth) return;
      lastWidth = el.offsetWidth;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(build);
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      clear();
      el.textContent = text;
    };
  }, [text, delay, stagger]);

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
}

export default LineMask;
