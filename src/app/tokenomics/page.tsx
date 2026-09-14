import { Header } from "@/components/Header";
import { StatsDashboard } from '@/components/tokenomicas'

export default function Home() {
  return (
    <div className="pages">
      <Header />
      
    <main className="container">
      <StatsDashboard />
    </main>
    </div>
  );
}