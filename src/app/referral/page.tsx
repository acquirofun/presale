import { Header } from "@/components/Header";
import { ReferralCodeGenerator } from "@/components/ReferralCodeGenerator";
import { ReferralStats } from "@/components/ReferralStats";
import { UserCreditsWithReferral } from "@/components/UserCredits";

export default function Home() {
  return (
    <div className="pages">
      <Header />
      
      <div className="container" style={{ marginTop: 'var(--spacing-xl)' }}>

        <div className="card mb-lg">
          <UserCreditsWithReferral />
        </div>

        {/* Referral System */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
          <ReferralCodeGenerator />
          <ReferralStats />
        </div>
        
      </div>
    </div>
  );
}