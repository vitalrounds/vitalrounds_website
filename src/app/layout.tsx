import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vitalrounds.com.au";

// Tab icon: `icon.png` + `apple-icon.png` in this folder (App Router file convention).
// Avoid `favicon.ico` here — browsers prefer it and it was still the default triangle.
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "VitalRounds | Clinical Observership Programs in Australia",
    template: "%s | VitalRounds",
  },
  description:
    "VitalRounds supports doctors and international medical graduates with clinical observership programs, clinical exposure, and local clinical experience pathways in Australia, Victoria, and Melbourne.",
  keywords: [
    "observership programs in Australia",
    "observership programs in Victoria",
    "clinical observership Australia",
    "clinical observership programs in Australia",
    "clinical observership programs in Victoria",
    "clinical observership programs in Melbourne",
    "clinical exposure",
    "local clinical experience",
    "clinical experience gap",
    "AMC1 training",
    "AMC2 training",
    "pass AMC exams",
    "AHPRA",
    "IMG observership Australia",
    "international medical graduates Australia",
    "medical observership placement",
    "hospital observership program",
    "doctor observership Australia",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "VitalRounds",
    title: "VitalRounds | Clinical Observership Programs in Australia",
    description:
      "Structured observership pathways, clinical exposure, and local clinical experience support for doctors and international medical graduates in Australia, Victoria, and Melbourne.",
    images: [
      {
        url: "/clinical-network-poster.png",
        alt: "VitalRounds clinical observership programs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VitalRounds | Clinical Observership Programs in Australia",
    description:
      "Structured observership pathways, clinical exposure, and local clinical experience support for doctors and international medical graduates in Australia, Victoria, and Melbourne.",
    images: ["/clinical-network-poster.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
