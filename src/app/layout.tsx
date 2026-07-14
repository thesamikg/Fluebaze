import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.name} — Influencer Campaign Management for Growing Brands`,
  description: `${siteConfig.description} Join the early-access waitlist.`,
  alternates: { canonical: "/" },
  openGraph: { title: `${siteConfig.name} — Influencer Campaign Management`, description: siteConfig.description, url: "/", siteName: siteConfig.name, type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title: `${siteConfig.name} — Influencer Campaign Management`, description: siteConfig.description },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${geist.variable} ${geistMono.variable}`}><body>{children}</body></html>;
}
