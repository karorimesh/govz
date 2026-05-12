"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import countries from "@/data/countries.json";
import languages from "@/data/languages.json";
import {
  dictionaries,
  type LanguageCode,
  type TranslationKey,
} from "@/lib/localization/dictionaries";

type Country = (typeof countries)[number];
type Language = (typeof languages)[number] & { code: LanguageCode };

type LocalizationContextValue = {
  countries: Country[];
  country: Country;
  languages: Language[];
  language: Language;
  setCountryCode: (code: string) => void;
  setLanguageCode: (code: LanguageCode) => void;
  t: (key: TranslationKey, fallback?: string) => string;
};

const LocalizationContext = createContext<LocalizationContextValue | null>(null);
const typedLanguages = languages as Language[];

export function LocalizationProvider({ children }: { children: React.ReactNode }) {
  const [countryCode, setCountryCodeState] = useState(() => {
    if (typeof window === "undefined") {
      return "KE";
    }

    const storedCountry = window.localStorage.getItem("govz.country");

    return storedCountry &&
      countries.some((country) => country.code === storedCountry)
      ? storedCountry
      : "KE";
  });
  const [languageCode, setLanguageCodeState] = useState<LanguageCode>(() => {
    if (typeof window === "undefined") {
      return "en";
    }

    const storedLanguage = window.localStorage.getItem("govz.language") as
      | LanguageCode
      | null;

    return storedLanguage && storedLanguage in dictionaries ? storedLanguage : "en";
  });

  const country =
    countries.find((countryItem) => countryItem.code === countryCode) ??
    countries[0];
  const language =
    typedLanguages.find((languageItem) => languageItem.code === languageCode) ??
    typedLanguages[0];

  const value = useMemo<LocalizationContextValue>(
    () => ({
      countries,
      country,
      languages: typedLanguages,
      language,
      setCountryCode: (code: string) => {
        setCountryCodeState(code);
        window.localStorage.setItem("govz.country", code);
      },
      setLanguageCode: (code: LanguageCode) => {
        setLanguageCodeState(code);
        window.localStorage.setItem("govz.language", code);
        document.documentElement.lang = code;
        document.documentElement.dir =
          typedLanguages.find((item) => item.code === code)?.direction ?? "ltr";
      },
      t: (key: TranslationKey, fallback?: string) =>
        dictionaries[languageCode][key] ?? fallback ?? dictionaries.en[key] ?? key,
    }),
    [country, language, languageCode],
  );

  useEffect(() => {
    document.documentElement.lang = language.code;
    document.documentElement.dir = language.direction;
  }, [language]);

  return (
    <LocalizationContext.Provider value={value}>
      {children}
    </LocalizationContext.Provider>
  );
}

export function useLocalization() {
  const context = useContext(LocalizationContext);

  if (!context) {
    throw new Error("useLocalization must be used inside LocalizationProvider");
  }

  return context;
}
