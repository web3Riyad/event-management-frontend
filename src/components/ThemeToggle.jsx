"use client";

import React, { useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

function subscribeTheme(callback) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("theme-changed", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("theme-changed", callback);
  };
}

function getThemeSnapshot() {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function getServerSnapshot() {
  return "light";
}

function subscribeMounted() {
  return () => {};
}

export default function ThemeToggle({ className = "" }) {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerSnapshot);
  const isMounted = useSyncExternalStore(subscribeMounted, () => true, () => false);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";

    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      try {
        localStorage.setItem("theme", "dark");
      } catch {
        // ignore
      }
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      try {
        localStorage.setItem("theme", "light");
      } catch {
        // ignore
      }
    }

    // Notify other components & subscribers
    window.dispatchEvent(new Event("theme-changed"));
  };

  if (!isMounted) {
    return (
      <button
        type="button"
        className={`p-2 rounded-xl text-gray-400 hover:text-[#D9A441] transition-all cursor-pointer opacity-70 ${className}`}
        aria-label="Toggle theme placeholder"
      >
        <Moon className="w-5 h-5" />
      </button>
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative inline-flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 dark:bg-black/30 dark:hover:bg-black/50 border border-white/10 dark:border-white/20 text-[#D9A441] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#D9A441]/50 cursor-pointer group shadow-sm hover:scale-105 active:scale-95 ${className}`}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 rotate-0 group-hover:rotate-45" />
      ) : (
        <Moon className="w-5 h-5 text-[#D9A441] transition-transform duration-300 -rotate-12 group-hover:rotate-0" />
      )}
      <span className="sr-only">
        {isDark ? "Light Mode" : "Dark Mode"}
      </span>
    </button>
  );
}
