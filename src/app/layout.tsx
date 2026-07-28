import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site-config";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.name} — Influencer CRM for E-commerce Brands`,
  description: `${siteConfig.description} Join the early-access pilot.`,
  alternates: { canonical: "/" },
  openGraph: { title: `${siteConfig.name} — The Influencer CRM for E-commerce`, description: siteConfig.description, url: "/", siteName: siteConfig.name, type: "website", locale: "en_US", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Fluebaze — The influencer CRM for e-commerce brands" }] },
  twitter: { card: "summary_large_image", title: `${siteConfig.name} — The Influencer CRM for E-commerce`, description: siteConfig.description, images: ["/og.png"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" className={`${geist.variable} ${geistMono.variable}`}><body>{children}</body></html>;
}
