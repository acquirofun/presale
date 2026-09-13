import { Header } from "@/components/Header";
import { ActionButtonList } from "@/components/ActionButtonList";
import { SendUSDC } from "@/components/SendUSDC";
import { CountdownTimer } from "@/components/CountdownTimer";
import { OfferInfo } from "@/components/OfferInfo";
import { StatsDashboard } from "@/components/StatsDashboard";

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

        {/* User Credits (still show for detailed view) */}
      </div>
    </div>
  );
}