// components/whitepaperas.jsx
'use client';

import React, { useState } from 'react';

export function Whitepaper() {
  const [activeSection, setActiveSection] = useState<string>('abstract');

  const scrollToSection = (id: string) => {
    setActiveSection(id);

    const element = document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const downloadPDF = () => {
    const link = document.createElement('a');

    link.href = '/whitepaper.pdf';
    link.download = 'whitepaper.pdf';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* Top Banner / Header */}
      <div className="mb-10 text-center sm:text-left border-b border-zinc-800 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Protocol Architecture & Tokenomics Whitepaper
        </h1>

        <p className="mt-2 text-sm sm:text-base text-zinc-400 max-w-3xl">
          A comprehensive breakdown of the core infrastructure, consensus mechanics, and distribution model powering the ecosystem.
        </p>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

        {/* Sticky Table of Contents Sidebar */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24 bg-zinc-900/60 border border-zinc-800/80 rounded-xl p-4 space-y-2">

            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 px-2">
              Table of Contents
            </h3>

            <nav className="space-y-1">

              {[
                { id: 'abstract', label: '1. Abstract' },
                { id: 'introduction', label: '2. Introduction' },
                { id: 'architecture', label: '3. Core Architecture' },
                { id: 'tokenomics', label: '4. Tokenomics & Rewards' },
                { id: 'conclusion', label: '5. Conclusion' },
              ].map((item) => (

                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeSection === item.id
                      ? 'bg-red-600/10 text-red-400 border border-red-500/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  {item.label}
                </button>

              ))}

            </nav>

            {/* Download PDF */}
            <div className="pt-4 border-t border-zinc-800 mt-4" style={{ margin: '30px 0'}}>

              <button
                type="button"
                onClick={downloadPDF}
                className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-semibold rounded-lg text-xs transition shadow-lg shadow-red-600/20 text-center"
                style={{ border: '2px dotted #ff0000', fontSize: '1rem', fontWeight: 'bold' }}
              >
                Download PDF Version
              </button>

            </div>

          </div>
        </aside>


        {/* Content Body */}
        <main className="lg:col-span-3 space-y-12 bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-6 sm:p-10 text-zinc-300 leading-relaxed">

          {/* Abstract */}
          <section id="abstract" className="space-y-4 scroll-mt-24">

            <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-2">
              1. Abstract
            </h2>

            <p>
              Modern decentralized applications face persistent bottlenecks relating to throughput, cross-chain fragmentation, and incentive alignment. This paper proposes a novel framework utilizing state-optimized execution layers paired with dynamic reward structures to sustain high scalability without sacrificing network security or decentralization.
            </p>

          </section>


          {/* Introduction */}
          <section id="introduction" className="space-y-4 scroll-mt-24">

            <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-2">
              2. Introduction
            </h2>

            <p>
              As Web3 adoption scales, underlying network infrastructures are pushed to their limits. Traditional monolithic layer architectures often result in soaring transaction fees and lagging confirmation times during periods of peak network congestion.
            </p>

            <p>
              Our approach separates execution state from consensus verification, allowing parallelized transaction processing while inheriting foundational security guarantees from underlying robust layers.
            </p>

          </section>


          {/* Core Architecture */}
          <section id="architecture" className="space-y-4 scroll-mt-24">

            <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-2">
              3. Core Architecture
            </h2>

            <p>
              The system relies on a three-tier processing model:
            </p>

            <ul className="list-disc pl-5 space-y-2 text-zinc-400">

              <li>
                <strong className="text-zinc-200">
                  Execution Layer:
                </strong>{' '}
                Processes user transactions and smart contract states locally.
              </li>

              <li>
                <strong className="text-zinc-200">
                  Validation Layer:
                </strong>{' '}
                Ensures cryptographic validity using zero-knowledge proofs.
              </li>

              <li>
                <strong className="text-zinc-200">
                  Settlement Layer:
                </strong>{' '}
                Secures the global canonical state and handles finality.
              </li>

            </ul>

          </section>

            <br/>
          {/* Tokenomics */}
          <section id="tokenomics" className="space-y-4 scroll-mt-24">

            <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-2">
              4. Tokenomics & Rewards
            </h2>

            <p>
              Ecosystem sustainability is anchored by a utility and governance token model. Participants earn credits and yields through active engagement, referrals, and liquidity provision, aligning community growth with platform success.
            </p>

            <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl">

              <span className="text-xs uppercase tracking-wider text-red-400 font-semibold">
                Key Metric
              </span>

              <p className="text-lg font-bold text-white mt-1">
                30% allocation reserved exclusively for community referral rewards and ecosystem incentives.
              </p>

            </div>

          </section>


          {/* Conclusion */}
          <section id="conclusion" className="space-y-4 scroll-mt-24">

            <h2 className="text-2xl font-bold text-white border-b border-zinc-800 pb-2">
              5. Conclusion
            </h2>

            <p>
              By combining high-performance execution routing with self-sustaining economic incentives, this protocol provides a scalable foundation for next-generation decentralized applications and user-driven networks.
            </p>

          </section>

        </main>

      </div>

    </div>
  );
}