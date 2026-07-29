"use client";

import { useRef } from "react";
import { gsap } from "gsap";

import { registerGsap, prefersReducedMotion } from "./MotionProvider";
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";

const identity = (n) => String(n);

/**
 * Count-up figure. Renders the final value on the server so the text never
 * differs between SSR and hydration.
 *
 * `playOnMount` skips ScrollTrigger entirely — used inside the dashboard,
 * which has no MotionProvider and whose figures sit above the fold.
 * `format` lets a caller render the running value however it likes (e.g.
 * through formatNumber) instead of the default pad/prefix/suffix.
 */
function Counter({
  value,
  pad = 0,
  prefix = "",
  suffix = "",
  format,
  playOnMount = false,
  className = "",
}) {
  const ref = useRef(null);

  const render = (n) =>
    format ? format(n) : `${prefix}${String(n).padStart(pad, "0")}${suffix}`;

  const final = render(value);

  useIsomorphicLayoutEffect(() => {
    registerGsap();
    const el = ref.current;
    if (!el) return undefined;

    if (prefersReducedMotion() || !Number.isFinite(value)) {
      el.textContent = final;
      return undefined;
    }

    const state = { value: 0 };
    const tween = gsap.to(state, {
      value,
      duration: 1.1,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = render(Math.round(state.value));
      },
      onComplete: () => {
        el.textContent = final;
      },
      ...(playOnMount
        ? {}
        : { scrollTrigger: { trigger: el, start: "top 90%", once: true } }),
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
      el.textContent = final;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, pad, prefix, suffix, final, playOnMount]);

  return (
    <span ref={ref} data-count={value} className={className}>
      {final}
    </span>
  );
}

export default Counter;

export { identity };
