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

export const metadata: Metadata = {
  title: "SquadRoll - What Should We Play Tonight?",
  description: "Find multiplayer games your whole squad owns on Steam, then let fate decide. No more arguments, just games.",
  keywords: ["steam", "multiplayer", "games", "party", "friends", "random", "picker"],
  openGraph: {
    title: "SquadRoll - What Should We Play Tonight?",
    description: "Find multiplayer games your whole squad owns on Steam, then let fate decide.",
    url: "https://squadroll.com",
    siteName: "SquadRoll",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SquadRoll - What Should We Play Tonight?",
    description: "Find multiplayer games your whole squad owns on Steam, then let fate decide.",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
