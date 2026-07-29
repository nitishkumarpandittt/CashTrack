"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export const THEME_STORAGE_KEY = "cashtrack-theme";

/**
 * Runs in <head>, before the first paint, so a returning visitor's theme is
 * already on <html> when the page renders instead of flashing light and then
 * correcting itself after hydration. Inlined as a string on purpose: it has to
 * execute ahead of any bundle, so it can have no imports and no dependencies.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY
)});if(t!=="dark"&&t!=="light"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.classList.toggle("dark",t==="dark")}catch(e){}})();`;

const ThemeContext = createContext(null);

const systemTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

/**
 * Theme state for the whole app.
 *
 * The *visual* theme lives entirely in CSS — the `dark` class on <html> swaps
 * the --cash-* token values — so components never read this context just to
 * pick a colour. It exists for the toggle, and for the handful of places that
 * hand colours to a non-CSS consumer (Clerk's appearance API, canvas).
 */
function ThemeProvider({ children }) {
  // Null until mounted. The server cannot know the visitor's choice, so the
  // first client render has to match the theme-agnostic HTML it hydrates.
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    let stored = null;
    try {
      stored = localStorage.getItem(THEME_STORAGE_KEY);
    } catch {
      // Private mode / storage disabled — fall back to the system preference.
    }
    setTheme(stored === "dark" || stored === "light" ? stored : systemTheme());
  }, []);

  // Follow the OS while the visitor has not made an explicit choice.
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event) => {
      let stored = null;
      try {
        stored = localStorage.getItem(THEME_STORAGE_KEY);
      } catch {
        /* ignore */
      }
      if (stored !== "dark" && stored !== "light") {
        setTheme(event.matches ? "dark" : "light");
      }
    };

    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // Keep <html> in step with state. The init script already did this for the
  // first paint; this covers every change after it.
  useEffect(() => {
    if (theme) document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const applyTheme = useCallback((next) => {
    setTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // The class still switches; only the preference is not remembered.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    // Before mount, read the class the init script wrote rather than guessing.
    setTheme((current) => {
      const resolved =
        current ?? (document.documentElement.classList.contains("dark") ? "dark" : "light");
      const next = resolved === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ theme, isDark: theme === "dark", setTheme: applyTheme, toggleTheme }),
    [theme, applyTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}

export default ThemeProvider;
