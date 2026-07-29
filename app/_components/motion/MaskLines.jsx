"use client";

import { useRef } from "react";
import { gsap } from "gsap";

import { registerGsap, prefersReducedMotion } from "./MotionProvider";
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";
import { onIntroReady } from "./intro-gate";
import { MASK_OFFSET } from "./mask-offset";

/**
 * Staggers any hand-authored `.line-mask__inner` elements inside.
 *
 * Used where the markup is too rich for LineMask's automatic word-splitting
 * (e.g. the hero h1, which contains a nested highlight span).
 *
 * `immediate` plays on the intro gate rather than on scroll — see Reveal.
 */
function MaskLines({ children, className = "", delay = 0, stagger = 0.1, immediate = false }) {
  const ref = useRef(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    const inners = el.querySelectorAll(".line-mask__inner");
    if (!inners.length) return undefined;

    let tween = null;

    if (immediate) {
      gsap.set(inners, { yPercent: MASK_OFFSET });
      const play = () => {
        tween = gsap.to(inners, {
          yPercent: 0,
          duration: 0.95,
          delay,
          stagger,
          ease: "power4.out",
        });
      };
      const cancel = onIntroReady(play);
      return () => {
        cancel();
        tween?.kill();
      };
    }

    tween = gsap.fromTo(
      inners,
      { yPercent: MASK_OFFSET },
      {
        yPercent: 0,
        duration: 0.95,
        delay,
        stagger,
        ease: "power4.out",
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      }
    );

    return () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, [delay, stagger, immediate]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default MaskLines;
