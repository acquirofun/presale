// components/whitepaper.tsx
'use client';

import React, { useState } from 'react';

const sections = [
  { id: 'executive-summary', number: '01', label: 'Executive Summary' },
  { id: 'vision', number: '02', label: 'Vision & Philosophy' },
  { id: 'dynamic-supply', number: '03', label: 'Dynamic Supply' },
  { id: 'token-allocation', number: '04', label: 'Token Allocation' },
  { id: 'valuation', number: '05', label: 'Valuation & Transparency' },
  { id: 'roadmap-risks', number: '06', label: 'Roadmap & Risks' },
];

const allocations = [
  { name: 'Presale', percentage: 30, description: 'Distributed to early participants during fundraising.', color: '#00ff88' },
  { name: 'Locked Reserve', percentage: 30, description: 'Long-term ecosystem development & treasury growth.', color: '#fb923c' },
  { name: 'Community', percentage: 15, description: 'Ecosystem incentives, user rewards, & growth campaigns.', color: '#facc15' },
  { name: 'Team', percentage: 10, description: 'Core contributors, aligned via strict vesting schedules.', color: '#c084fc' },
  { name: 'Investors', percentage: 10, description: 'Strategic backers and early partners with lock-ups.', color: '#60a5fa' },
  { name: 'Liquidity Pool', percentage: 5, description: 'Initial DEX/CEX market liquidity provisioning.', color: '#22d3ee' },
];

const roadmapPhases = [
  { phase: 'Phase 1', title: 'Foundation', text: 'Concept finalization, tokenomics architecture, smart contract design, and web portal setup.' },
  { phase: 'Phase 2', title: 'Presale Execution', text: 'Public presale launch, community engagement, and real-time transaction monitoring.' },
  { phase: 'Phase 3', title: 'Token Generation & Launch', text: 'Final supply calculation, smart contract deployment, and liquidity provisioning.' },
  { phase: 'Phase 4', title: 'Ecosystem Expansion', text: 'Rollout of utility programs, governance research, and strategic integrations.' },
];

const valuationData = [
  { supply: '50,000,000 PTS', price: '$0.04', fdv: '$2,000,000' },
  { supply: '100,000,000 PTS', price: '$0.04', fdv: '$4,000,000' },
  { supply: '250,000,000 PTS', price: '$0.04', fdv: '$10,000,000' },
  { supply: '500,000,000 PTS', price: '$0.04', fdv: '$20,000,000' },
];

export function Whitepaper() {
  const [activeSection, setActiveSection] = useState('executive-summary');
  const [hoveredAllocation, setHoveredAllocation] = useState<string | null>(null);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = '/PointSwap_Whitepaper.pdf';
    link.download = 'PointSwap_Whitepaper.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ backgroundColor: '#030303', color: '#d4d4d8', minHeight: '100vh', fontFamily: 'sans-serif', padding: '2rem 1rem' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        
        {/* HERO SECTION */}
        <div style={{ background: 'linear-gradient(135deg, #18181b 0%, #09090b 100%)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '3rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Official Whitepaper | Version 1.1 (Dynamic Model)
            </span>
          </div>

          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#fff', margin: '0 0 1rem 0' }}>
            Point<span style={{ color: '#00ff88' }}>Swap (PTS)</span>
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: '1.1rem', maxWidth: '700px', lineHeight: '1.6' }}>
            An advanced blockchain-based token project designed around a transparent, dynamic supply model and structured token distribution framework.
          </p>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button onClick={downloadPDF} style={{ background: '#00ff88', color: '#030303', border: 'none', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              Download PDF
            </button>
            <button onClick={() => scrollToSection('token-allocation')} style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
              Explore Tokenomics ↓
            </button>
          </div>
        </div>

        {/* STICKY HORIZONTAL TABLE OF CONTENTS HEADER */}
        <div style={{ 
          position: 'sticky', 
          top: '1rem', 
          zIndex: 50, 
          background: 'rgba(9, 9, 11, 0.85)', 
          backdropFilter: 'blur(12px)', 
          border: '1px solid rgba(255,255,255,0.1)', 
          borderRadius: '16px', 
          padding: '0.75rem 1rem', 
          marginBottom: '2rem',
          display: 'flex',
          gap: '0.5rem',
          overflowX: 'auto',
          whiteSpace: 'nowrap'
        }}>
          {sections.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                style={{
                  background: isActive ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(0, 255, 136, 0.4)' : '1px solid transparent',
                  borderRadius: '10px',
                  padding: '8px 14px',
                  color: isActive ? '#fff' : '#a1a1aa',
                  fontSize: '13px',
                  fontWeight: isActive ? 'bold' : 'normal',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
              >
                <span style={{ color: '#00ff88', fontFamily: 'monospace', fontSize: '11px' }}>{item.number}</span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* MAIN CONTENT AREA */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Section 1 */}
          <SectionCard id="executive-summary" number="01" title="Executive Summary">
            <p>PointSwap is an advanced blockchain-based token project designed around a transparent, dynamic supply model and a structured token distribution framework. The PointSwap ecosystem utilizes PTS as its native utility and governance-aligned asset.</p>
            <p>The initial presale price is established at <strong>$0.04 USDC per PTS</strong>. Unlike conventional fixed-supply models where total supply is arbitrarily predetermined before fundraising, PointSwap utilizes a dynamic supply architecture. The final total token supply is calculated following the conclusion of the presale phase based on finalized participation metrics, maintaining strict, invariant percentage allocations across all categories.</p>
          </SectionCard>

          {/* Section 2 */}
          <SectionCard id="vision" number="02" title="Vision & Core Philosophy">
            <p>PointSwap aims to establish a transparent token ecosystem where participants can clearly understand how supply is determined, how tokens are distributed, and how long-term ecosystem stability is managed.</p>
            <div style={{ background: 'rgba(0, 255, 136, 0.05)', borderLeft: '4px solid #00ff88', padding: '1rem', borderRadius: '0 12px 12px 0', marginTop: '1rem' }}>
              <p style={{ fontWeight: 'bold', color: '#fff', margin: '0 0 0.5rem 0', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '1px' }}>Core Principle</p>
              <p style={{ margin: 0, fontStyle: 'italic' }}>Transparent mechanics before marketing. By publishing the exact mathematical relationship and allocation structures governing the token, PointSwap ensures complete clarity for all ecosystem participants.</p>
            </div>
          </SectionCard>

          {/* Section 3 */}
          <SectionCard id="dynamic-supply" number="03" title="Dynamic Token Supply Mechanism">
            <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>3.1 Why PointSwap Uses Dynamic Supply</h3>
            <p>PointSwap implements a dynamic supply model to align token generation with actual ecosystem demand demonstrated during the presale phase, ensuring structural proportions remain mathematically locked.</p>
            
            <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '1rem 0 0.5rem 0' }}>3.2 How the Dynamic Supply Operates</h3>
            <ul style={{ paddingLeft: '1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>The presale price is fixed at $0.04 USDC per PTS.</li>
              <li>The presale allocation represents exactly 30% of the final total token supply.</li>
              <li>Once the presale concludes and eligible contributions are verified, the final total token supply is calculated dynamically based on total tokens required to satisfy the 30% presale allocation.</li>
              <li>Consequently, all other allocation categories scale proportionally to match final calculated supply while percentage shares remain completely unchanged.</li>
            </ul>
          </SectionCard>

          {/* Section 4 */}
          <SectionCard id="token-allocation" number="04" title="Token Allocation Breakdown">
            <p>Regardless of the final absolute supply calculated at the close of the presale, percentage shares remain strictly fixed:</p>
            
            <div style={{ display: 'flex', height: '24px', width: '100%', background: '#18181b', borderRadius: '12px', overflow: 'hidden', margin: '1.5rem 0' }}>
              {allocations.map((item) => (
                <div
                  key={item.name}
                  onMouseEnter={() => setHoveredAllocation(item.name)}
                  onMouseLeave={() => setHoveredAllocation(null)}
                  style={{
                    width: `${item.percentage}%`,
                    backgroundColor: item.color,
                    opacity: hoveredAllocation && hoveredAllocation !== item.name ? 0.3 : 1,
                    cursor: 'pointer',
                    transition: 'opacity 0.2s'
                  }}
                  title={`${item.name}: ${item.percentage}%`}
                />
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {allocations.map((item) => (
                <div key={item.name} style={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{item.name}</span>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: item.color }}>{item.percentage}%</span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#71717a', margin: 0 }}>{item.description}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Section 5 */}
          <SectionCard id="valuation" number="05" title="Valuation & Transparency Matrix">
            <p>Because PointSwap utilizes a dynamic supply model, the Fully Diluted Valuation (FDV) is directly tied to the final supply established at presale completion:</p>
            
            <div style={{ overflowX: 'auto', marginTop: '1rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '10px', color: '#fff' }}>Final Total Supply</th>
                    <th style={{ padding: '10px', color: '#fff' }}>Presale Price</th>
                    <th style={{ padding: '10px', color: '#fff' }}>Implied Fully Diluted Valuation (FDV)</th>
                  </tr>
                </thead>
                <tbody>
                  {valuationData.map((row, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px', fontFamily: 'monospace', color: '#d4d4d8' }}>{row.supply}</td>
                      <td style={{ padding: '10px', fontFamily: 'monospace', color: '#d4d4d8' }}>{row.price}</td>
                      <td style={{ padding: '10px', fontFamily: 'monospace', color: '#00ff88', fontWeight: 'bold' }}>{row.fdv}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SectionCard>

          {/* Section 6 */}
          <SectionCard id="roadmap-risks" number="06" title="Roadmap & Risk Factors">
            <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>6.1 Strategic Roadmap</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              {roadmapPhases.map((phase) => (
                <div key={phase.phase} style={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '1rem' }}>
                  <span style={{ color: '#00ff88', fontWeight: 'bold', fontSize: '12px', textTransform: 'uppercase' }}>{phase.phase} - {phase.title}</span>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#a1a1aa' }}>{phase.text}</p>
                </div>
              ))}
            </div>

            <h3 style={{ color: '#fff', fontSize: '1.1rem', margin: '1rem 0 0.5rem 0' }}>6.2 Risk Factors & Disclaimers</h3>
            <div style={{ background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '12px', padding: '1rem' }}>
              <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.6' }}>Digital assets involve substantial risk, including market volatility, smart-contract vulnerabilities, liquidity fluctuations, and regulatory shifts. Participants should independently evaluate the project. PointSwap makes no guarantees regarding future exchange listings, price appreciation, or market capitalizations.</p>
            </div>
          </SectionCard>

        </div>

      </div>
    </div>
  );
}

function SectionCard({ id, number, title, children }: { id: string; number: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} style={{ background: '#09090b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '2.5rem', scrollMarginTop: '6rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
        <span style={{ background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', border: '1px solid rgba(0, 255, 136, 0.3)', padding: '6px 12px', borderRadius: '8px', fontFamily: 'monospace', fontWeight: 'bold', fontSize: '14px' }}>
          {number}
        </span>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#fff', margin: 0 }}>{title}</h2>
      </div>
      <div style={{ color: '#a1a1aa', fontSize: '15px', lineHeight: '1.7', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {children}
      </div>
    </div>
  );
}