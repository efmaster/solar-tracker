import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/lib/locale-provider";
import PWARegister from "@/components/pwa-register";
import { translations, getLocale } from "@/lib/i18n";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateMetadata({ params }: RootLayoutProps): Metadata {
  const locale = getLocale(params.locale)
  return {
    title: translations[locale].appTitle,
    description: translations[locale].appDescription,
    manifest: '/manifest.json',
  }
}

interface RootLayoutProps {
  children: React.ReactNode
  params: { locale: string }
}

export default function RootLayout({
  children,
  params,
}: Readonly<RootLayoutProps>) {
  const lang = params.locale || 'de'
  return (
    <html
      lang={lang}
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Solar Tracker" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <LocaleProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </LocaleProvider>
        <PWARegister />
      </body>
    </html>
  );
}
