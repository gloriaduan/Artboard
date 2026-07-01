import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import BackToTop from "@/components/BackToTop";
import TanStackProvider from "@/components/providers/TanStackProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Fraunces — the expressive display serif carrying the brand voice (headings +
// wordmark). Variable across weight and its optical-size/soft axes; `swap` shows
// the Georgia fallback immediately so there's no invisible-text flash.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  // Variable across the full weight range (we set weight per element in CSS),
  // plus the optical-size and soft axes for Fraunces's hand-made character.
  // next/font forbids pairing an explicit `weight` with `axes`, so weight is
  // left variable.
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "Museum Collage",
  description:
    "Your personal art collection — browse, save, and arrange artworks from the world's greatest museums.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body>
        <TanStackProvider>{children}</TanStackProvider>
        <BackToTop />
      </body>
    </html>
  );
}
