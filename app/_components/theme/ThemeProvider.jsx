"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore } from "react";

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

const MEDIA_QUERY = "(prefers-color-scheme: dark)";

// The preference lives outside React (localStorage + the OS media query), so
// it is read through useSyncExternalStore rather than copied into state from
// an effect. `memoryTheme` covers browsers where storage is unavailable: the
// toggle still works for the session even if the choice cannot be remembered.
let memoryTheme = null;
const listeners = new Set();

const readStored = () => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "dark" || stored === "light" ? stored : null;
  } catch {
    return null;
  }
};

const systemTheme = () => (window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light");

const getSnapshot = () => memoryTheme ?? readStored() ?? systemTheme();

// The server cannot know the visitor's choice, so the first client render has
// to match the theme-agnostic HTML it hydrates.
const getServerSnapshot = () => null;

function subscribe(listener) {
  listeners.add(listener);
  const media = window.matchMedia(MEDIA_QUERY);
  media.addEventListener("change", listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", listener);
    window.removeEventListener("storage", listener);
  };
}

function writeTheme(next) {
  memoryTheme = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // The class still switches; only the preference is not remembered.
  }
  listeners.forEach((listener) => listener());
}

/**
 * Theme state for the whole app.
 *
 * The *visual* theme lives entirely in CSS — the `dark` class on <html> swaps
 * the --cash-* token values — so components never read this context just to
 * pick a colour. It exists for the toggle, and for the handful of places that
 * hand colours to a non-CSS consumer (Clerk's appearance API, canvas).
 */
function ThemeProvider({ children }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep <html> in step. The init script already did this for the first
  // paint; this covers every change after it.
  useEffect(() => {
    if (theme) document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const applyTheme = useCallback((next) => writeTheme(next), []);

  const toggleTheme = useCallback(() => {
    // Before the store has been read, trust the class the init script wrote.
    const current =
      getSnapshot() ?? (document.documentElement.classList.contains("dark") ? "dark" : "light");
    writeTheme(current === "dark" ? "light" : "dark");
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
