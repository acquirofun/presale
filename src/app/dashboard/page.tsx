import { Header } from "@/components/Header";
import { UserCredits } from "@/components/UserCredits";
import { ValueDisplay } from "@/components/ValueDisplay";
import { StatsDashboard } from "@/components/StatsDashboard";
import Link from "next/dist/client/link";

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


        

        <Link href="/home" className="landing-button">
          BUY MORE
        </Link>

        {/* User Credits (still show for detailed view) */}
        
      </div>
    </div>
  );
}