import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect runs before paint (so GSAP can set the "from" state without
 * a flash) but warns during SSR. Fall back to useEffect on the server.
 */
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default useIsomorphicLayoutEffect;
