import { Header } from "@/components/Header";
import { SendUSDC } from "@/components/SendUSDC";
import { UserCredits } from "@/components/UserCredits";
import { OfferInfo } from "@/components/OfferInfo";
import { ValueDisplay } from "@/components/ValueDisplay";
import { StatsDashboard } from "@/components/StatsDashboard";

export default function Home() {
  return (
    <div className="pages">
      <Header />
      
      <div className="container" style={{ marginTop: 'var(--spacing-xl)' }}>
        {/* Hero Section with Countdown */}

        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <UserCredits />
        </div>

        {/* Value Display Section */}
        <ValueDisplay />

        {/* Stats Dashboard */}
        <StatsDashboard />


        {/* Offer Info */}
        <OfferInfo />

        {/* Send USDC Widget */}

        <div className="card mb-lg">
        <p>BUY MORE</p>
          <SendUSDC />
        </div>

        {/* User Credits (still show for detailed view) */}
        
      </div>
    </div>
  );
}