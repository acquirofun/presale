// src/app/layout.tsx
import type { Metadata } from "next";

import "./globals.css";
import ContextProvider from "@/context";
import WalletSync from "@/components/WalletSync";

export const metadata: Metadata = {
  title: "Pointswap",
  description: "Pointswap presale",
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