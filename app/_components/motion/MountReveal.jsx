"use client";

import { useRef } from "react";
import { gsap } from "gsap";

import { registerGsap, prefersReducedMotion } from "./MotionProvider";
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";

/**
 * Entrance reveal for the app shell.
 *
 * Deliberately does *not* use ScrollTrigger or the landing page's intro gate:
 * the dashboard has no MotionProvider or preloader to release that gate, and
 * dashboard content is fetched async and mostly above the fold. Playing
 * straight off mount means content can never end up stranded at opacity 0.
 *
 * Shorter and smaller than the marketing reveal — an app should settle, not
 * perform.
 */
function MountReveal({ children, className = "", delay = 0, y = 14, as: Tag = "div" }) {
  const ref = useRef(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return undefined;
    }

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y },
      { opacity: 1, y: 0, duration: 0.5, delay, ease: "power2.out" }
    );

    // GSAP runs on requestAnimationFrame, which browsers pause in background
    // tabs. It resumes on focus, but a stranded dashboard is far worse than a
    // stranded marketing hero, so force the end state on a timer (which keeps
    // running regardless) if the tween has not finished.
    const failsafe = setTimeout(() => {
      if (tween.progress() < 1) {
        tween.kill();
        gsap.set(el, { opacity: 1, y: 0, clearProps: "transform" });
      }
    }, 2500);

    return () => {
      clearTimeout(failsafe);
      tween.kill();
    };
  }, [delay, y]);

  return (
    <Tag ref={ref} className={className}>
      {children}
    </Tag>
  );
}

export default MountReveal;
