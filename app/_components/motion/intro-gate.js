/**
 * Release gate for above-the-fold animations.
 *
 * Hero content must not depend on a ScrollTrigger: while the preloader holds
 * the page (scroll locked, overflow hidden) triggers cannot evaluate, so
 * anything already in view would stay hidden until the user scrolled.
 * Instead the preloader releases this gate and hero elements play on cue.
 */
let released = false;
let waiters = [];

export function releaseIntro() {
  if (released) return;
  released = true;
  const queue = waiters;
  waiters = [];
  queue.forEach((fn) => {
    try {
      fn();
    } catch {
      /* a failed listener must not block the rest */
    }
  });
}

export function onIntroReady(fn) {
  if (released) {
    fn();
    return () => {};
  }
  waiters.push(fn);
  return () => {
    waiters = waiters.filter((entry) => entry !== fn);
  };
}

export function isIntroReleased() {
  return released;
}

/** Test/navigation helper — lets a fresh mount re-arm the gate. */
export function resetIntroGate() {
  released = false;
  waiters = [];
}
