"use client";

import Link from "next/link";
import { useLocalization } from "@/components/localization/localization-provider";

const socialPlatforms = ["Facebook", "X / Twitter", "Instagram", "LinkedIn", "YouTube"];

export function AppFooter() {
  const { t } = useLocalization();

  return (
    <footer className="border-t border-[#d9dfd2] bg-[#17201a] text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-5 py-8 sm:grid-cols-2 lg:grid-cols-3 lg:px-8">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#c9d8c2]">
            {t("footer.phoneContacts")}
          </h2>
          <address className="mt-4 flex flex-col gap-2 text-sm not-italic text-[#eef4ea]">
            <Link className="w-fit hover:text-[#f7c948]" href="tel:+254700000000">
              {t("footer.mainOffice")}: +254 700 000 000
            </Link>
            <Link className="w-fit hover:text-[#f7c948]" href="tel:+254711111111">
              {t("footer.helpLine")}: +254 711 111 111
            </Link>
            <Link className="w-fit hover:text-[#f7c948]" href="tel:999">
              {t("footer.urgentSupport")}: 999
            </Link>
          </address>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#c9d8c2]">
            {t("footer.socialPlatforms")}
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {socialPlatforms.map((platform) => (
              <Link
                className="rounded-md border border-white/15 px-3 py-2 text-sm text-[#eef4ea] transition hover:border-[#f7c948] hover:text-[#f7c948]"
                href="/"
                key={platform}
              >
                {platform}
              </Link>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#c9d8c2]">
            {t("footer.address")}
          </h2>
          <address className="mt-4 text-sm leading-6 not-italic text-[#eef4ea]">
            GOVZ Civic Services Office
            <br />
            Public Service Avenue
            <br />
            Nairobi City County, Kenya
            <br />
            P.O. Box 00000-00100
          </address>
        </section>
      </div>
    </footer>
  );
}
