"use client";

import { useRef } from "react";
import { gsap } from "gsap";

import { registerGsap, prefersReducedMotion } from "./MotionProvider";
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";
import { onIntroReady } from "./intro-gate";

/**
 * Block reveal. Same props and single wrapper div as before, so layout is
 * unchanged.
 *
 * `immediate` is for above-the-fold content: it plays when the preloader
 * releases the intro gate instead of waiting for a ScrollTrigger. Scroll
 * triggers cannot fire while the preloader has the page locked, so hero
 * content would otherwise stay invisible until the first scroll.
 */
function Reveal({ children, className = "", delay = 0, y = 22, immediate = false }) {
  const ref = useRef(null);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      gsap.set(el, { opacity: 1, y: 0 });
      return undefined;
    }

    let tween = null;

    if (immediate) {
      gsap.set(el, { opacity: 0, y });
      const play = () => {
        tween = gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          delay,
          ease: "power3.out",
        });
      };
      const cancel = onIntroReady(play);
      return () => {
        cancel();
        tween?.kill();
      };
    }

    tween = gsap.fromTo(
      el,
      { opacity: 0, y },
      {
        opacity: 1,
        y: 0,
        duration: 0.65,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 82%",
          once: true,
        },
      }
    );

    return () => {
      tween?.scrollTrigger?.kill();
      tween?.kill();
    };
  }, [delay, y, immediate]);

  return (
    <div ref={ref} data-reveal className={className}>
      {children}
    </div>
  );
}

export default Reveal;
