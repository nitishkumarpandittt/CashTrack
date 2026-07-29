"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { registerGsap, prefersReducedMotion } from "./MotionProvider";

/**
 * Scroll-linked transform wrapper.
 *
 * The brief distinguishes two scrub modes and this preserves that split:
 *   scrub: true  -> locked 1:1 to the scrollbar (hero media)
 *   scrub: 1     -> 1s catch-up smoothing (everything else)
 */
function Scrub({
  children,
  className = "",
  from = {},
  to = {},
  scrub = 1,
  start = "top bottom",
  end = "bottom top",
}) {
  const ref = useRef(null);

  useEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    const tween = gsap.fromTo(el, from, {
      ...to,
      ease: "none",
      scrollTrigger: { trigger: el, start, end, scrub },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      gsap.set(el, { clearProps: "all" });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrub, start, end]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default Scrub;
