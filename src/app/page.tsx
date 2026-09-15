"use client";

import { useAppKit, useAppKitAccount } from "@reown/appkit/react";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  const [loading, setLoading] = useState(false);
  const previousAddress = useRef<string | undefined>(undefined);

  const signupWallet = async (walletAddress: string) => {
    try {
      setLoading(true);

      const response = await fetch("/api/auth/wallet-signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          walletAddress,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Failed to create account."
        );
      }

      // Account created / existing account found.
      window.location.href = "/home";
    } catch (error) {
      console.error("Signup error:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

      setLoading(false);
    }
  };

  // After the user connects the wallet in the popup,
  // automatically create/find the account.
  useEffect(() => {
    if (!isConnected || !address) {
      return;
    }

    // Prevent this effect from running repeatedly
    // for the same connected wallet.
    if (previousAddress.current === address) {
      return;
    }

    previousAddress.current = address;

    signupWallet(address);
  }, [isConnected, address]);

  const handleStart = async () => {
    if (!isConnected || !address) {
      await open();
      return;
    }

    await signupWallet(address);
  };

  return (
    <main className="landing-page">
      <section className="landing-card">
        <h1 className="landing-title">
          Ready to Start Your Journey?
        </h1>

        <p className="landing-description">
          Connect your wallet and begin your adventure.
          <br />
          <strong>
            Get 5,000 Credits instantly when you join.
          </strong>
        </p>

        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
          className="landing-button"
        >
          {loading
            ? "Creating Account..."
            : isConnected
              ? "Let's Go →"
              : "Connect Wallet →"}
        </button>
        <br/>
        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
          className="landing-button"
          style={{
              background: "red",
              color: "white",
            }}
        >
         <a href="/home">No, Thanks. I don&apos;t want this</a>
        </button>
      </section>
    </main>
  );
}