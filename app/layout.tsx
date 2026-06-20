import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import TopNav from "@/components/TopNav";
import StoreProvider from "@/components/StoreProvider";
import SoundProvider from "@/components/SoundProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Legend of Ki — Competitive Ninja TCG",
  description:
    "A dark-fantasy competitive trading card game. Build your clan, climb the ranks, master the shadows.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SoundProvider />
        <StoreProvider>
          <TopNav />
          <main className="flex-1">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
