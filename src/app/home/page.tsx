import { Header } from "@/components/Header";
import { ActionButtonList } from "@/components/ActionButtonList";
import { SendUSDC } from "@/components/SendUSDC";
import { CountdownTimer } from "@/components/CountdownTimer";
import { OfferInfo } from "@/components/OfferInfo";
import { StatsDashboard } from "@/components/StatsDashboard";
import { ReferralCodeGenerator } from "@/components/ReferralCodeGenerator";
import { ReferralStats } from "@/components/ReferralStats";
import { UserCreditsWithReferral } from "@/components/UserCredits";

export default function Home() {
  return (
    <div className="pages">
      <Header />
      
      <div className="container" style={{ marginTop: 'var(--spacing-xl)' }}>
        {/* Hero Section with Countdown */}
        <div className="card mb-lg">
          <CountdownTimer />
        </div>

        {/* Stats Dashboard */}
        <StatsDashboard />

        {/* Referral System */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
          <ReferralCodeGenerator />
          <ReferralStats />
        </div>

        {/* Network Actions */}
        <div className="card mb-lg">
          <ActionButtonList />
        </div>

        {/* Offer Info */}
        <OfferInfo />

        {/* Send USDC Widget */}
        <div className="card mb-lg">
          <SendUSDC />
        </div>

        {/* User Credits with Referral Link */}
        <div className="card mb-lg">
          <UserCreditsWithReferral />
        </div>
      </div>
    </div>
  );
}