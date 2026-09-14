import { Header } from "@/components/Header";
import { Whitepaper } from '@/components/whitepaperas';

export default function Home() {
  return (
    <div className="pages">
      <Header />
      
    <main className="container">
      <Whitepaper/>
    </main>
    </div>
  );
}