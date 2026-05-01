import { createContext, useContext, useState } from "react";
import { translations } from "../i18n/translations";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("esm.lang") || "en");

  const toggleLang = () => {
    const next = lang === "en" ? "tr" : "en";
    setLang(next);
    localStorage.setItem("esm.lang", next);
  };

  const t = (key, params = {}) => {
    const dict = translations[lang] || translations.en;
    const str = dict[key] ?? translations.en[key] ?? key;
    if (!params || Object.keys(params).length === 0) return str;
    return Object.entries(params).reduce((s, [k, v]) => s.replace(`{${k}}`, String(v)), str);
  };

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
