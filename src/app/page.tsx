import Link from "next/link";

export default function Home() {
  return (
    <main className="landing-page">
      <section className="landing-card">
        <h1 className="landing-title">
          Ready to Start Your Journey?
        </h1>

        <p className="landing-description">
          Connect your wallet and begin your adventure.
          Your journey starts here.
        </p>

        <Link href="/home" className="landing-button">
          Let&apos;s Go →
        </Link>
      </section>
    </main>
  );
}