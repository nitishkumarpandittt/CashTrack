"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { registerGsap, prefersReducedMotion } from "./MotionProvider";

/**
 * 82px follower (z-200), hidden until the pointer enters an element carrying
 * data-cursor="Label". Movement uses the brief's lerp: cx += (mx - cx) * .14
 */
function CursorLabel() {
  const elRef = useRef(null);

  useEffect(() => {
    registerGsap();
    const el = elRef.current;
    if (!el) return undefined;

    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine || prefersReducedMotion()) return undefined;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let active = false;

    const setX = gsap.quickSetter(el, "x", "px");
    const setY = gsap.quickSetter(el, "y", "px");

    const onMove = (event) => {
      mx = event.clientX;
      my = event.clientY;

      const target = event.target.closest?.("[data-cursor]");
      const shouldShow = Boolean(target);

      if (shouldShow !== active) {
        active = shouldShow;
        if (target) el.textContent = target.getAttribute("data-cursor") || "";
        gsap.to(el, {
          opacity: active ? 1 : 0,
          scale: active ? 1 : 0.5,
          duration: 0.4,
          ease: "power3.out",
          overwrite: true,
        });
      } else if (active && target) {
        const next = target.getAttribute("data-cursor") || "";
        if (el.textContent !== next) el.textContent = next;
      }
    };

    const tick = () => {
      cx += (mx - cx) * 0.14;
      cy += (my - cy) * 0.14;
      setX(cx);
      setY(cy);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      gsap.ticker.remove(tick);
      gsap.killTweensOf(el);
    };
  }, []);

  return <div ref={elRef} className="cursor-label" aria-hidden="true" />;
}

export default CursorLabel;
