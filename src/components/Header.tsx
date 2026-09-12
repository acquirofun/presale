'use client'

import { useState, useEffect } from 'react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { createClient } from '@supabase/supabase-js'
import Image from "next/image"

const supabase = createClient(
  process.env.SUPABASE_URL || "https://kifydthslaqeqmohvetb.supabase.co", 
  process.env.SUPABASE_KEY || "sb_publishable_gPldRZjoctXxbEuEmy1GjA_EjzSLjqk"
)

export function Header() {
  const { isConnected, address } = useAppKitAccount()
  const { open } = useAppKit()
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchCredits() {
      if (!isConnected || !address) {
        setCredits(0)
        return
      }

      setLoading(true)
      const { data } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('wallet_address', address.toLowerCase())
        .single()

      if (data) {
        setCredits(data.credits)
      } else {
        setCredits(0)
      }
      setLoading(false)
    }

    fetchCredits()
  }, [isConnected, address])

  return (
    <header className="header">
      <div className="header-nav" style={{ marginRight: 'var(--spacing-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <Image 
            src="/bnb.png" 
            alt="Logo" 
            width={40} 
            height={40}
            style={{ borderRadius: '8px' }}
          />
          <span style={{ 
            fontSize: '1.25rem', 
            fontWeight: '700',
            background: 'linear-gradient(135deg, #00d4aa 0%, #00ff88 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Multichain
          </span>
        </div>
        
        <nav style={{ display: 'flex', gap: 'var(--spacing-lg)' }}>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500' }}>
            Referral
          </a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500' }}>
            Stake
          </a>
          <a href="#" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500' }}>
            Stats
          </a>
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
        {isConnected && (
          <div style={{ 
            background: 'linear-gradient(135deg, rgba(0, 212, 170, 0.1) 0%, rgba(0, 255, 136, 0.1) 100%)', 
            border: '1px solid rgba(0, 212, 170, 0.3)', 
            borderRadius: 'var(--radius-md)', 
            padding: '8px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              background: 'var(--primary)',
              boxShadow: '0 0 8px rgba(0, 212, 170, 0.5)'
            }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Balance
              </span>
              <span style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '0.9rem' }}>
                {loading ? '...' : credits.toLocaleString()}
                <span style={{ color: 'var(--text-muted)', fontWeight: '400', fontSize: '0.75rem', marginLeft: '2px' }}>
                  Credits
                </span>
              </span>
            </div>
          </div>
        )}
        <button 
          onClick={() => open()}
          className="primary"
          style={{ 
            fontSize: '0.875rem', 
            padding: '10px 20px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #00d4aa 0%, #00ff88 100%)',
            border: 'none',
            color: '#000',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            borderRadius: 'var(--radius-sm)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 212, 170, 0.3)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          {isConnected ? 'Open Wallet' : 'Connect Wallet'}
        </button>
      </div>
    </header>
  )
}