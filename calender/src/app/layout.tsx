import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";

import { THEME_STORAGE_KEY } from "@/components/theme/theme";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "Calendar Atelier",
  description:
    "A premium Next.js foundation for building interactive calendar experiences.",
};

const themeInitScript = `
  (function () {
    try {
      var storageKey = ${JSON.stringify(THEME_STORAGE_KEY)};
      var storedTheme = window.localStorage.getItem(storageKey);
      var theme = storedTheme === "dark" ? "dark" : "light";
      var root = document.documentElement;
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
    } catch (error) {}
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${manrope.variable} ${ibmPlexMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-full bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
