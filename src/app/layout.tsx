import type { Metadata } from "next";
import { AppFooter } from "@/components/layout/app-footer";
import { AppHeader } from "@/components/layout/app-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "GOVZ",
  description: "A modern civic services workspace powered by Firebase and OpenAI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <AppHeader />
        {children}
        <AppFooter />
      </body>
    </html>
  );
}
