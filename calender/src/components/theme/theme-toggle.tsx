"use client";

import { useEffect, useSyncExternalStore } from "react";
import { motion } from "framer-motion";

import {
  THEME_STORAGE_KEY,
  resolveAppTheme,
  type AppTheme,
} from "@/components/theme/theme";

const toggleSpring = {
  type: "spring",
  stiffness: 420,
  damping: 30,
  mass: 0.8,
} as const;
const themeListeners = new Set<() => void>();

function getThemeSnapshot(): AppTheme {
  if (typeof document === "undefined") {
    return "light";
  }

  return resolveAppTheme(document.documentElement.dataset.theme);
}

function getThemeServerSnapshot(): AppTheme {
  return "light";
}

function subscribeToTheme(listener: () => void) {
  themeListeners.add(listener);

  return () => {
    themeListeners.delete(listener);
  };
}

function applyDocumentTheme(nextTheme: AppTheme, persist = true) {
  const root = document.documentElement;
  root.dataset.theme = nextTheme;
  root.style.colorScheme = nextTheme;

  if (persist) {
    window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
  }

  themeListeners.forEach((listener) => listener());
}

export function ThemeToggle() {
  const theme = useSyncExternalStore(
    subscribeToTheme,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );

  useEffect(() => {
    const root = document.documentElement;
    const initialTheme = resolveAppTheme(
      window.localStorage.getItem(THEME_STORAGE_KEY) ?? root.dataset.theme,
    );

    applyDocumentTheme(initialTheme, false);
    root.classList.add("theme-ready");
  }, []);

  function handleToggle() {
    const nextTheme = theme === "light" ? "dark" : "light";
    applyDocumentTheme(nextTheme);
  }

  const isDark = theme === "dark";
  const buttonLabel = isDark ? "Dark Mode" : "Light Mode";
  const buttonActionLabel = isDark ? "Switch to light mode" : "Switch to dark mode";

  return (
    <button
      aria-label={buttonActionLabel}
      aria-pressed={isDark}
      className="theme-toggle inline-flex items-center gap-3 rounded-full border px-2 py-2 backdrop-blur-xl"
      onClick={handleToggle}
      type="button"
    >
      <span className="hidden pl-2 font-mono text-[0.64rem] uppercase tracking-[0.24em] text-muted sm:inline">
        {buttonLabel}
      </span>
      <span className="theme-toggle-track relative flex h-9 w-16 items-center rounded-full p-1">
        <motion.span
          layout
          transition={toggleSpring}
          className={`theme-toggle-thumb flex h-7 w-7 items-center justify-center rounded-full ${isDark ? "ml-auto" : ""}`}
        >
          {isDark ? <MoonIcon /> : <SunIcon />}
        </motion.span>
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="4.25" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M12 2.75v2.5M12 18.75v2.5M5.45 5.45l1.75 1.75M16.8 16.8l1.75 1.75M2.75 12h2.5M18.75 12h2.5M5.45 18.55l1.75-1.75M16.8 7.2l1.75-1.75"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        d="M19.25 14.6A7.75 7.75 0 0 1 9.4 4.75a7.75 7.75 0 1 0 9.85 9.85Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}
