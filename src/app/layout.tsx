
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

          {/* BEGIN AADS AD UNIT 2455447 */}

          <div style={{ position: "absolute", zIndex: 99999 }}>
            <input
              autoComplete="off"
              type="checkbox"
              id="aadsstickymu2x7ize"
              hidden
            />

            <div style={{ paddingTop: 0, paddingBottom: 0 }}>
              <div
                style={{
                  width: "200px",
                  height: "200px",
                  position: "fixed",
                  textAlign: "center",
                  fontSize: 0,
                  top: "50%",
                  transform: "translateY(-50%)",
                  right: 0,
                }}
              >
                <label
                  htmlFor="aadsstickymu2x7ize"
                  style={{
                    top: "-24px",
                    left: 0,
                    position: "absolute",
                    borderRadius: "4px",
                    background: "rgba(248, 248, 249, 0.70)",
                    padding: "4px",
                    zIndex: 99999,
                    cursor: "pointer",
                  }}
                >
                  <svg
                    fill="#000000"
                    height="16px"
                    width="16px"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 490 490"
                  >
                    <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337 " />
                  </svg>
                </label>

                <div
                  id="frame"
                  style={{
                    width: "200px",
                    margin: "auto",
                    zIndex: 99998,
                    height: "auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <iframe
                    data-aa="2455447"
                    src="//ad.a-ads.com/2455447/?size=200x200"
                    style={{
                      border: 0,
                      padding: 0,
                      width: "200px",
                      height: "200px",
                      overflow: "hidden",
                      margin: "0 auto",
                    }}
                  />
                </div>
              </div>

              <style>
                {`
                  #aadsstickymu2x7ize:checked + div {
                    display: none;
                  }
                `}
              </style>
            </div>
          </div>

          {/* END AADS AD UNIT 2455447 */}
        </ContextProvider>
      </body>
    </html>
  );
}
