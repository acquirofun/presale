'use client'

import { useState, useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_KEY'
  )
}

const supabase = createClient(supabaseUrl, supabaseKey)

export function ValueDisplay() {
  const { isConnected, address } = useAppKitAccount()

  const [userCredits, setUserCredits] = useState<number>(0)
  const [totalUSDCSent, setTotalUSDCSent] = useState<number>(0)
  const [pointData, setPointData] = useState<number>(0)
  const [totalUSDCecoSent, setTotalUSDCecoSent] = useState<number>(0)

  useEffect(() => {
    async function fetchData() {
      // Reset values when wallet is disconnected
      if (!isConnected || !address) {
        setUserCredits(0)
        setTotalUSDCSent(0)
        setPointData(0)
        setTotalUSDCecoSent(0)
        return
      }

      const walletAddress = address.toLowerCase()

      // Fetch current user's credits
      const { data: creditData, error: creditError } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('wallet_address', walletAddress)
        .single()

      if (!creditError && creditData) {
        setUserCredits(Number(creditData.credits) || 0)
      } else {
        setUserCredits(0)
      }

      // Fetch total USDC sent by current user
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('sender_address', walletAddress)
        .eq('status', 'SUCCESS')

      if (!txError && txData) {
        const total = txData.reduce(
          (sum, tx) => sum + (Number(tx.amount) || 0),
          0
        )

        setTotalUSDCSent(total)
      } else {
        setTotalUSDCSent(0)
      }

      const { data: txecoData, error: txecoError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'SUCCESS')

      if (!txecoError && txecoData) {
        const total = txecoData.reduce(
          (sum, tx) => sum + (Number(tx.amount) || 0),
          0
        )

        setTotalUSDCecoSent(total)
      } else {
        setTotalUSDCecoSent(0)
      }

      // Fetch TOTAL points/credits acquired by ALL users
      const { data: allPointsData, error: allPointsError } = await supabase
        .from('user_credits')
        .select('credits')

      if (!allPointsError && allPointsData) {
        const totalPoints = allPointsData.reduce(
          (sum, row) => sum + (Number(row.credits) || 0),
          0
        )

        setPointData(totalPoints)
      } else {
        setPointData(0)
      }
    }

    fetchData()
  }, [isConnected, address])

  // Hypothetical values for listing and moon
  const listingPrice = 0.04 // $0.04 per credit
  const moonPrice = 0.10 // $0.10 per credit

  const tlsupply = (totalUSDCecoSent*.60/0.04)/0.05
  const alpre = tlsupply * 0.3
  const presaled = (userCredits/pointData) * alpre
  const listingValue = presaled * listingPrice 
  const moonValue = presaled * moonPrice

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)',
      }}
    >
      <div className="value-card">
        <div className="value-label">USDC Contribution</div>
        <div className="value-amount">
          ${totalUSDCSent.toFixed(2)}
        </div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          USDC Sent
        </div>
      </div>

      <div className="value-card">
        <div className="value-label">USDC Raised</div>
        <div className="value-amount">
          ${totalUSDCecoSent.toFixed(2)}
        </div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          Total USDC Raised in the Economy
        </div>
      </div>

      <div className="value-card">
        <div className="value-label">Token Allocation</div>
        <div className="value-amount">
          {(listingValue / 0.04).toFixed(2)}
        </div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          Probable SWC (SwapCredits) Allocation
        </div>
      </div>

      <div className="value-card">
        <div className="value-label">Current Stage Value</div>
        <div className="value-amount">
          {pointData.toFixed(2)}
        </div>
        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
          Credits in the Economy
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

      <div
        className="value-card"
        style={{
          background: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '12px',
          padding: '16px',
          color: '#f4f4f5',
        }}
      >
        <div
          className="value-label"
          style={{
            color: '#ef4444',
            fontWeight: '600',
            fontSize: '0.875rem',
            marginBottom: '4px',
          }}
        >
          Refer & Earn
        </div>

        <div className="value-amount" style={{ margin: '8px 0' }}>
          <p
            style={{
              fontSize: '1.25rem',
              fontWeight: 'bold',
              color: '#ffffff',
              margin: 0,
            }}
          >
            30% credits!
          </p>
        </div>

        <div
          className="text-muted"
          style={{
            fontSize: '0.75rem',
            color: '#a1a1aa',
            lineHeight: '1.4',
          }}
        >
          Let&apos;s grow together! Share your referral link and earn extra
          credits when your friends join.
        </div>
      </div>
    </div>
  )
}