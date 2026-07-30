import type { Metadata } from "next";
import { Fraunces, Source_Serif_4 } from "next/font/google";
import { Providers } from "@/components/providers";
import { Sidebar, MobileNav } from "@/components/layout/sidebar";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Apiary App — Beekeeping Management",
  description:
    "Modern apiary management for Agra, Oklahoma beekeepers. Track hives, inspections, mite counts, honey yields, and expenses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fraunces.variable} ${sourceSerif.variable} honeycomb-bg min-h-screen`}
      >
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex flex-1 flex-col">
              <main className="flex-1 pb-20 lg:pb-0">{children}</main>
              <MobileNav />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
