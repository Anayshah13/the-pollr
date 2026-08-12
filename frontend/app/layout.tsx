import type { Metadata, Viewport } from "next";
import { Syne } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { GoogleAnalytics } from "@/components/GoogleAnalytics";

const pollrDisplay = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-pollr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pollr — Live preference rankings",
  description:
    "Live preference rankings across committees—three vote modes, one Pollr Score.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={pollrDisplay.variable}>
      <body>
        <GoogleAnalytics />
        <Nav />
        <main>{children}</main>
      </body>
    </html>
  );
}
