// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";
import ContextProvider from "@/context";
import WalletSync from "@/components/WalletSync";

export const metadata: Metadata = {
  metadataBase: new URL("https://presaler1.vercel.app/"),

  title: {
    default: "Pointswap | Token Presale",
    template: "%s | Pointswap",
  },

  description:
    "Join the Pointswap token presale, connect your wallet, and track your token allocation.",

  applicationName: "Pointswap",

  keywords: [
    "Pointswap",
    "Pointswap Token",
    "Pointswap Presale",
    "crypto presale",
    "token presale",
    "Web3",
    "crypto",
  ],

  authors: [
    {
      name: "Pointswap",
    },
  ],

  creator: "Pointswap",
  publisher: "Pointswap",

  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },

  openGraph: {
    type: "website",
    siteName: "Pointswap",
    title: "Pointswap | Token Presale",
    description:
      "Join the Pointswap token presale, connect your wallet, and track your token allocation.",
    url: "https://presaler1.vercel.app/",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pointswap Token Presale",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Pointswap | Token Presale",
    description:
      "Join the Pointswap token presale and track your token allocation.",
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