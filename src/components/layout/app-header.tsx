"use client";

import Link from "next/link";
import { Bell, Building2, UserCircle } from "lucide-react";
import { NavLink } from "@/components/layout/nav-link";
import { useLocalization } from "@/components/localization/localization-provider";
import type { LanguageCode, TranslationKey } from "@/lib/localization/dictionaries";

const navigationItems = [
  { href: "/government-structure", labelKey: "nav.governmentStructure" },
  { href: "/the-law", labelKey: "nav.theLaw" },
  { href: "/public-vote", labelKey: "nav.publicVote" },
  { href: "/opinion-polls", labelKey: "nav.opinionPolls" },
  { href: "/help-line", labelKey: "nav.helpLine" },
] satisfies Array<{ href: string; labelKey: TranslationKey }>;

const countrySelectClass =
  "h-10 max-w-24 rounded-md border border-[#d1d8ca] bg-transparent px-2 text-sm text-[#34423a] outline-none transition hover:bg-[#e7ebe2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6f5e]";
const languageSelectClass =
  "h-10 max-w-24 rounded-md border border-[#d1d8ca] bg-transparent px-2 text-sm text-[#34423a] outline-none transition hover:bg-[#e7ebe2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6f5e]";

export function AppHeader() {
  const {
    countries,
    country,
    languages,
    language,
    setCountryCode,
    setLanguageCode,
    t,
  } = useLocalization();

  return (
    <header className="border-b border-[#d9dfd2] bg-[#f7f8f3]/95">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <Link
          aria-label="GOVZ home"
          className="flex w-fit items-center gap-3 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2f6f5e]"
          href="/"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-[#173c32] text-white">
            <Building2 aria-hidden="true" size={22} strokeWidth={2.2} />
          </span>
          <span className="text-xl font-semibold tracking-normal text-[#17201a]">
            GOVZ
          </span>
        </Link>

        <nav
          aria-label={t("nav.primary")}
          className="flex flex-wrap items-center gap-1"
        >
          {navigationItems.map((item) => (
            <NavLink
              href={item.href}
              key={item.href}
              label={t(item.labelKey)}
            />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <label className="sr-only" htmlFor="country-selector">
            {t("nav.selectCountry")}
          </label>
          <select
            aria-label={t("nav.selectCountry")}
            className={countrySelectClass}
            id="country-selector"
            onChange={(event) => setCountryCode(event.target.value)}
            value={country.code}
          >
            {countries.map((countryItem) => (
              <option key={countryItem.code} value={countryItem.code}>
                {countryItem.flagIcon} {countryItem.code}
              </option>
            ))}
          </select>
          <label className="sr-only" htmlFor="language-selector">
            {t("nav.selectLanguage")}
          </label>
          <select
            aria-label={t("nav.selectLanguage")}
            className={languageSelectClass}
            id="language-selector"
            onChange={(event) =>
              setLanguageCode(event.target.value as LanguageCode)
            }
            value={language.code}
          >
            {languages.map((languageItem) => (
              <option key={languageItem.code} value={languageItem.code}>
                {languageItem.nativeName}
              </option>
            ))}
          </select>
          <button
            aria-label={t("nav.notifications")}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d1d8ca] text-[#34423a] transition hover:bg-[#e7ebe2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6f5e]"
            type="button"
          >
            <Bell aria-hidden="true" size={20} />
          </button>
          <button
            aria-label={t("nav.profile")}
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d1d8ca] text-[#34423a] transition hover:bg-[#e7ebe2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6f5e]"
            type="button"
          >
            <UserCircle aria-hidden="true" size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
