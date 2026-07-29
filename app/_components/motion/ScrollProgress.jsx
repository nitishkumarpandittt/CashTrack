"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { registerGsap, prefersReducedMotion } from "./MotionProvider";

/** Fixed 3px bar that scales 0 -> 1 across the page. */
function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    registerGsap();
    const el = barRef.current;
    if (!el || prefersReducedMotion()) return undefined;

    const tween = gsap.to(el, {
      scaleX: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}

export default ScrollProgress;
