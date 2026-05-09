import type { Metadata } from "next";
import "./globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Marquee } from "@/components/Marquee";

export const metadata: Metadata = {
  title: "Pollr — The Public Sentiment Index",
  description:
    "Aggregated preference data across student bodies, four input modalities, one weighted score.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Marquee />
        <Nav />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
