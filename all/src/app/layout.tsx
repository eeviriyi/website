import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { NextIntlClientProvider } from "next-intl";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const notoSansSC = localFont({
  display: "swap",
  src: [
    {
      path: "../../public/fonts/noto-sans-sc-v39-chinese-simplified-100.woff2",
      style: "normal",
      weight: "100",
    },
    {
      path: "../../public/fonts/noto-sans-sc-v39-chinese-simplified-regular.woff2",
      style: "normal",
      weight: "400",
    },
    {
      path: "../../public/fonts/noto-sans-sc-v39-chinese-simplified-700.woff2",
      style: "normal",
      weight: "700",
    },
  ],
  variable: "--font-noto-sans-sc",
});

export const metadata: Metadata = {
  description: "Welcome to Eeviriyi's personal website!",
  title: "Eeviriyi",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} ${notoSansSC.variable} antialiased`}>
        <ThemeProvider attribute="class">
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
