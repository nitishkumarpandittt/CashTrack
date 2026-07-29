"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

import { setLenis } from "./lenis-instance";
import { releaseIntro } from "./intro-gate";

let registered = false;

/** Registers ScrollTrigger exactly once, client-side only. */
export function registerGsap() {
  if (!registered && typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return gsap;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Owns the Lenis smooth-scroll loop and keeps ScrollTrigger in sync with it.
 * Brief values: duration 1.15, wheelMultiplier 0.9.
 */
function MotionProvider({ children }) {
  useEffect(() => {
    registerGsap();

    // Backstop: whatever happens to the preloader, above-the-fold content is
    // never left hidden. Timer-based so it survives a stalled rAF.
    const introBackstop = setTimeout(releaseIntro, 5500);

    // Harder backstop. The gate only creates the tween; if GSAP's rAF loop is
    // stalled the tween never advances and the content stays at opacity 0.
    // Force anything *currently on screen* to its visible end state. Scoped to
    // the viewport so genuine below-the-fold scroll reveals still play later.
    const visibilityBackstop = setTimeout(() => {
      const onScreen = (el) => {
        const r = el.getBoundingClientRect();
        return r.bottom > 0 && r.top < window.innerHeight && r.width > 0;
      };

      document.querySelectorAll("[data-reveal]").forEach((el) => {
        if (onScreen(el) && Number(getComputedStyle(el).opacity) < 0.99) {
          el.style.opacity = "1";
          el.style.transform = "none";
        }
      });

      document.querySelectorAll(".line-mask__inner").forEach((el) => {
        const transform = getComputedStyle(el).transform;
        if (onScreen(el) && transform && transform !== "none") {
          el.style.transform = "none";
        }
      });
    }, 8000);

    // Fonts swap in after first paint and change element heights, which
    // invalidates every measured trigger position.
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh()).catch(() => {});
    }

    if (prefersReducedMotion()) {
      releaseIntro();
      clearTimeout(introBackstop);
      clearTimeout(visibilityBackstop);
      return undefined;
    }

    const root = document.documentElement;
    root.classList.add("lenis");

    const lenis = new Lenis({
      duration: 1.15,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
      smoothWheel: true,
    });

    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Anchor links have to go through Lenis or they fight the RAF loop.
    const onAnchorClick = (event) => {
      const link = event.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      event.preventDefault();
      lenis.scrollTo(target, { offset: -90 });
    };

    document.addEventListener("click", onAnchorClick);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      clearTimeout(introBackstop);
      clearTimeout(visibilityBackstop);
      document.removeEventListener("click", onAnchorClick);
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      setLenis(null);
      root.classList.remove("lenis");
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return children;
}

export default MotionProvider;
