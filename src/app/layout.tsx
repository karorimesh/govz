import type { Metadata } from "next";
import { LocalizationProvider } from "@/components/localization/localization-provider";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "GOVZ",
  description: "A modern civic services workspace powered by Firebase and Azure Foundry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <LocalizationProvider>
          <AppHeader />
          {children}
          <AppFooter />
        </LocalizationProvider>
      </body>
    </html>
  );
}
