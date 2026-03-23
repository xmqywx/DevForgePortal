"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import en from "./en.json";
import zh from "./zh.json";

const dictionaries = { en, zh } as const;
type Locale = keyof typeof dictionaries;

// Get nested key from dictionary
function get(obj: any, path: string): string {
  return path.split(".").reduce((o, k) => o?.[k], obj) ?? path;
}

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("devforge_locale") as Locale;
    if (saved && dictionaries[saved]) setLocaleState(saved);
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem("devforge_locale", l);
  }

  function t(key: string): string {
    return get(dictionaries[locale], key);
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
