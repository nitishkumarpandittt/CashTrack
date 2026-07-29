"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import { onIntroReady } from "./motion/intro-gate";

// three + the fluid sim are browser-only, and there is nothing meaningful to
// server-render for a decorative canvas.
const LiquidEther = dynamic(() => import("./LiquidEther"), { ssr: false });

/**
 * Palette stops map to velocity: index 0 is slow-moving fluid, the last is the
 * fastest. So the field reads as a pale wash that deepens to teal where it
 * moves quickest — CashTrack's own colours rather than the demo's purples.
 *
 * Declared at module scope on purpose: `colors` sits in LiquidEther's effect
 * dependency array, so a fresh array literal each render would tear down and
 * rebuild the entire WebGL simulation on every re-render.
 */
const CASH_FLUID_COLORS = ["#e6f4f2", "#50c878", "#007a74"];

/**
 * How long after the intro gate the hero entrance keeps animating: MaskLines
 * run 0.05s delay + 0.2s stagger + 0.95s, the last Reveal 0.55s + 0.65s, so
 * everything has settled by ~1.2s. The sim boots after that, with margin.
 */
const HERO_SETTLE_MS = 1400;

function HeroFluidBackground() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Desktop only (lg, same breakpoint as the hero's two-column layout).
    // On phones and tablets the sim is pure decoration at a real GPU/battery
    // cost, and the scrim covers most of it anyway.
    const desktop = window.matchMedia("(min-width: 1024px)");

    // Hold the simulation back until the hero text has finished animating in.
    // The intro gate alone is not enough: it fires as the entrance tweens
    // *start*, so the three.js chunk load, WebGL context creation and shader
    // compile all landed mid-animation and made the text visibly stutter.
    // Waiting out the entrance, then asking for an idle slot, keeps that
    // one-off cost away from every frame the user is watching.
    let timer = null;
    let idle = null;
    let settled = false;
    const evaluate = () => setEnabled(!reduced.matches && desktop.matches);

    const detach = onIntroReady(() => {
      timer = setTimeout(() => {
        settled = true;
        if ("requestIdleCallback" in window) {
          idle = requestIdleCallback(evaluate, { timeout: 1000 });
        } else {
          evaluate();
        }
      }, HERO_SETTLE_MS);
    });

    // Rotating a tablet past lg or toggling reduced motion re-evaluates, but
    // never before the intro has settled — that would re-create the stutter.
    const sync = () => {
      if (settled) evaluate();
    };
    reduced.addEventListener("change", sync);
    desktop.addEventListener("change", sync);
    return () => {
      detach();
      if (timer) clearTimeout(timer);
      if (idle && "cancelIdleCallback" in window) cancelIdleCallback(idle);
      reduced.removeEventListener("change", sync);
      desktop.removeEventListener("change", sync);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <div
        // pointer-events-none keeps the hero's buttons and links clickable. The
        // sim still tracks the cursor because it listens on window and hit-tests
        // with getBoundingClientRect rather than relying on pointer events.
        className="fluid-in pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black_10%,black_55%,transparent_92%)] [-webkit-mask-image:linear-gradient(to_bottom,black_10%,black_55%,transparent_92%)]"
        aria-hidden="true"
      >
        <LiquidEther
        colors={CASH_FLUID_COLORS}
        mouseForce={18}
        cursorSize={110}
        resolution={0.45}
        isViscous={false}
        iterationsPoisson={24}
        BFECC
        autoDemo
        autoSpeed={0.36}
        autoIntensity={1.7}
        takeoverDuration={0.25}
          autoResumeDelay={2400}
          autoRampDuration={0.8}
          // A blurred fluid gains nothing from HiDPI rendering, and capping
          // this at 1 quarters the fragment work on a retina display.
          maxPixelRatio={1}
        />
      </div>

      {/*
        Scrim. Body copy is --cash-muted, which measures only 2.3:1 against the
        fluid at full tilt — well under AA. Rather than fading the whole effect
        to ~10% opacity (the only level where that text passes unaided), this
        backs the copy with near-mist and leaves the right-hand side, where the
        dashboard preview sits, fully vivid.

        Rendered after the canvas and at the same -z-10, so it paints over the
        fluid but stays behind the hero content. On small screens the layout is
        a single column, so the scrim covers the full width instead.
      */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,rgba(244,248,247,0.92)_0%,rgba(244,248,247,0.88)_62%,rgba(244,248,247,0.45)_100%)] lg:bg-[linear-gradient(to_right,rgba(244,248,247,0.94)_0%,rgba(244,248,247,0.9)_38%,rgba(244,248,247,0.5)_56%,rgba(244,248,247,0)_72%)]"
        aria-hidden="true"
      />
    </>
  );
}

export default HeroFluidBackground;
