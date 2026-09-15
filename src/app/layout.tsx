// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import ContextProvider from "@/context";
import WalletSync from "@/components/WalletSync";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.swapcredits.xyz"),

  title: {
    default: "SwapCredits | Token Presale",
    template: "%s | SwapCredits",
  },

  description:
    "Join the SwapCredits token presale, connect your wallet, and track your token allocation.",

  applicationName: "SwapCredits",

  keywords: [
    "SwapCredits",
    "SwapCredits Token",
    "SwapCredits Presale",
    "crypto presale",
    "token presale",
    "Web3",
    "crypto",
  ],

  authors: [
    {
      name: "SwapCredits",
    },
  ],

  creator: "SwapCredits",
  publisher: "SwapCredits",

  icons: {
    icon: "/favicon.jpeg",
    shortcut: "/favicon.jpeg",
    apple: "/favicon.jpeg",
  },

  openGraph: {
    type: "website",
    siteName: "SwapCredits",
    title: "SwapCredits | Token Presale",
    description:
      "Join the SwapCredits token presale, connect your wallet, and track your token allocation.",
    url: "https://www.swapcredits.xyz",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SwapCredits Token Presale",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "SwapCredits | Token Presale",
    description:
      "Join the SwapCredits token presale and track your token allocation.",
    images: ["/og-image.png"],
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#000000",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ContextProvider>
          <WalletSync />
          {children}
        </ContextProvider>
      </body>
    </html>
  );
}