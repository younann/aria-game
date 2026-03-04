import React, { createContext, useContext, useEffect, useMemo } from "react";
import en from "../locales/en";
import he from "../locales/he";
import ar from "../locales/ar";

const LOCALES = { en, he, ar };
const RTL_LANGS = new Set(["he", "ar"]);

const I18nContext = createContext(null);

function interpolate(str, params) {
  if (!params || typeof str !== "string") return str;
  return str.replace(/\{\{(\w+)\}\}/g, (_, key) => (key in params ? params[key] : `{{${key}}}`));
}

function lookup(locale, fallback, key) {
  return locale[key] !== undefined ? locale[key] : fallback[key] !== undefined ? fallback[key] : key;
}

export function I18nProvider({ lang = "en", children }) {
  const dir = RTL_LANGS.has(lang) ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, [lang, dir]);

  const value = useMemo(() => {
    const locale = LOCALES[lang] || en;
    const t = (key, params) => interpolate(lookup(locale, en, key), params);
    return { t, lang, dir };
  }, [lang, dir]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
