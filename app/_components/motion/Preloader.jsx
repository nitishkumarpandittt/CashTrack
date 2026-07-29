"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { registerGsap, prefersReducedMotion } from "./MotionProvider";
import useIsomorphicLayoutEffect from "./useIsomorphicLayoutEffect";
import { getLenis } from "./lenis-instance";
import { releaseIntro } from "./intro-gate";

const SESSION_KEY = "cashtrack:preloaded";

/**
 * Full-bleed intro curtain (z-1000). Exits on power4.inOut over 0.9s.
 *
 * The markup is always rendered so server and client agree — gating it on
 * sessionStorage during render would break hydration and force React to throw
 * away the server HTML. Instead it is hidden in a layout effect (before paint)
 * when it has already played this session or motion is reduced.
 */
function Preloader() {
  const rootRef = useRef(null);
  const barRef = useRef(null);
  const countRef = useRef(null);
  const markRef = useRef(null);

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    registerGsap();

    let alreadyPlayed = false;
    try {
      alreadyPlayed = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // Private-mode storage errors are non-fatal; just play the intro.
    }

    if (alreadyPlayed || prefersReducedMotion()) {
      root.style.display = "none";
      releaseIntro();
      return undefined;
    }

    const lenis = getLenis();
    lenis?.stop();
    document.body.style.overflow = "hidden";

    const counter = { value: 0 };
    const tl = gsap.timeline({
      onComplete: () => {
        try {
          sessionStorage.setItem(SESSION_KEY, "1");
        } catch {
          /* ignore */
        }
        document.body.style.overflow = "";
        getLenis()?.start();
        ScrollTrigger.refresh();
        releaseIntro();
      },
    });

    tl.fromTo(
      markRef.current,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
    )
      .to(barRef.current, { scaleX: 1, duration: 1.05, ease: "power2.inOut" }, 0.1)
      .to(
        counter,
        {
          value: 100,
          duration: 1.05,
          ease: "power2.inOut",
          onUpdate: () => {
            if (countRef.current) {
              countRef.current.textContent = String(Math.round(counter.value)).padStart(3, "0");
            }
          },
        },
        0.1
      )
      .to(markRef.current, { opacity: 0, y: -14, duration: 0.35, ease: "power2.in" }, ">-0.05")
      // Brief's exit: power4.inOut, 0.9s.
      .to(root, { yPercent: -100, duration: 0.9, ease: "power4.inOut" }, ">-0.1")
      .set(root, { display: "none" });

    // GSAP is driven by requestAnimationFrame, which browsers pause in
    // background tabs. Without this the curtain could stay up and keep the
    // page scroll-locked. setTimeout keeps running, so it force-clears.
    const failsafe = setTimeout(() => {
      if (tl.progress() < 1) {
        tl.kill();
        root.style.display = "none";
        document.body.style.overflow = "";
        getLenis()?.start();
        ScrollTrigger.refresh();
      }
      releaseIntro();
    }, 5000);

    return () => {
      clearTimeout(failsafe);
      tl.kill();
      document.body.style.overflow = "";
      getLenis()?.start();
    };
  }, []);

  return (
    <div ref={rootRef} className="preloader">
      <div ref={markRef} className="preloader__inner">
        {/* Decorative: the wordmark beside it already names the brand. */}
        <Image
          src="/cashtrack-icon-theme.svg"
          alt=""
          width={40}
          height={40}
          priority
          className="h-9 w-9 sm:h-10 sm:w-10"
        />
        <span className="font-display text-2xl font-extrabold tracking-[-0.06em] text-white sm:text-3xl">
          CashTrack
        </span>
        <span
          ref={countRef}
          className="preloader__count font-display text-xs font-bold tracking-[0.16em] text-[var(--cash-emerald)]"
        >
          000
        </span>
      </div>
      <div className="preloader__bar">
        <span ref={barRef} />
      </div>
    </div>
  );
}

export default Preloader;
