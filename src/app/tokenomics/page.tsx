import { Header } from "@/components/Header";
import { StatsDashboard } from '@/components/tokenomicas'

export default function Home() {
  return (
    <div className="pages">
      <Header />
      
    <main className="container" style={{ marginTop: 'var(--spacing-xl)', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <StatsDashboard />
      <a href="/home/#buy-usdc-widget" className="landing-button" >
          BUY MORE & MORE
        </a>
    </main>
    </div>
  );
}