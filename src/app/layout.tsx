import type { Metadata } from "next";
import { Fraunces, Source_Serif_4 } from "next/font/google";
import { Providers } from "@/components/providers";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
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
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: [{ url: "/brand/apiary-logo.png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${fraunces.variable} ${sourceSerif.variable} honeycomb-bg min-h-screen`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
