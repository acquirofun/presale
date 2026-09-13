'use client'

import { useState, useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || "https://kifydthslaqeqmohvetb.supabase.co", 
  process.env.SUPABASE_KEY || "sb_publishable_gPldRZjoctXxbEuEmy1GjA_EjzSLjqk"
)

export function ValueDisplay() {
  const { isConnected, address } = useAppKitAccount()
  const [userCredits, setUserCredits] = useState<number>(0)
  const [totalUSDCSent, setTotalUSDCSent] = useState<number>(0)

  useEffect(() => {
    async function fetchData() {
      if (!isConnected || !address) {
        setUserCredits(0)
        setTotalUSDCSent(0)
        return
      }

      // Fetch user credits
      const { data: creditData } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('wallet_address', address.toLowerCase())
        .single()

      if (creditData) {
        setUserCredits(creditData.credits)
      }

      // Fetch total USDC sent by user
      const { data: txData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('sender_address', address.toLowerCase())
        .eq('status', 'SUCCESS')

      if (txData) {
        const total = txData.reduce((sum, tx) => sum + tx.amount, 0)
        setTotalUSDCSent(total)
      }
    }

    fetchData()
  }, [isConnected, address])

  // Hypothetical values for listing and moon
  const listingPrice = 0.01 // $0.01 per credit
  const moonPrice = 0.10 // $0.10 per credit
  
  const listingValue = userCredits * listingPrice
  const moonValue = userCredits * moonPrice

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
      gap: 'var(--spacing-md)',
      marginBottom: 'var(--spacing-lg)'
    }}>
      <div className="value-card">
        <div className="value-label">Current Stage Value</div>
        <div className="value-amount">
          ${totalUSDCSent.toFixed(2)}
        </div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          USDC Sent
        </div>
      </div>

      <div className="value-card">
        <div className="value-label">Listing Value</div>
        <div className="value-amount">
          ${listingValue.toFixed(2)}
        </div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          Based on listing price of ${listingPrice}
        </div>
      </div>

      <div className="value-card">
        <div className="value-label">Potential Moon Value</div>
        <div className="value-amount">
          ${moonValue.toFixed(2)}
        </div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          Based on moon price of ${moonPrice}
        </div>
      </div>

      <div className="value-card" style={{ background: '#DF301C', color: '#000' }}>
        <div className="value-label">Refer & Earn</div>
        <div className="value-amount">
          <p>30% credits!</p>
        </div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          Let&apos;s grow together! Share your referral link and earn extra credits when your friends join.
        </div>
      </div>
    </div>
  )
}