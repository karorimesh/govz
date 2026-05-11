import Link from "next/link";
import { Bell, Building2, Flag, Languages, UserCircle } from "lucide-react";
import { NavLink } from "@/components/layout/nav-link";

const navigationItems = [
  { href: "/government-structure", label: "Government Structure" },
  { href: "/the-law", label: "The Law" },
  { href: "/public-vote", label: "Public Vote" },
  { href: "/opinion-polls", label: "Opinion Polls" },
  { href: "/help-line", label: "Help Line" },
];

export function AppHeader() {
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
          aria-label="Primary navigation"
          className="flex flex-wrap items-center gap-1"
        >
          {navigationItems.map((item) => (
            <NavLink href={item.href} key={item.href} label={item.label} />
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            aria-label="Select country"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d1d8ca] text-[#34423a] transition hover:bg-[#e7ebe2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6f5e]"
            type="button"
          >
            <Flag aria-hidden="true" size={20} />
          </button>
          <button
            aria-label="Select language"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d1d8ca] text-[#34423a] transition hover:bg-[#e7ebe2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6f5e]"
            type="button"
          >
            <Languages aria-hidden="true" size={20} />
          </button>
          <button
            aria-label="View notifications"
            className="flex h-10 w-10 items-center justify-center rounded-md border border-[#d1d8ca] text-[#34423a] transition hover:bg-[#e7ebe2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2f6f5e]"
            type="button"
          >
            <Bell aria-hidden="true" size={20} />
          </button>
          <button
            aria-label="Open user profile"
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
