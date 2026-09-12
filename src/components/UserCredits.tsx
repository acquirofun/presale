// src/components/UserCredits.tsx
'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useAppKitAccount } from '@reown/appkit/react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || "https://kifydthslaqeqmohvetb.supabase.co", 
  process.env.SUPABASE_KEY || "sb_publishable_gPldRZjoctXxbEuEmy1GjA_EjzSLjqk"
)

export function UserCredits() {
  const { address: evmAddress } = useAccount()
  const { address: solanaAddress, isConnected } = useAppKitAccount()
  
  const activeAddress = (evmAddress || solanaAddress)?.toLowerCase()
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchCredits() {
      if (!isConnected || !activeAddress) {
        setCredits(0)
        return
      }

      setLoading(true)
      const { data } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('wallet_address', activeAddress)
        .single()

      if (data) {
        setCredits(data.credits)
      } else {
        setCredits(0) // New user with 0 credits
      }
      setLoading(false)
    }

    fetchCredits()
  }, [isConnected, activeAddress])

  if (!isConnected) return null

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>My Credits</h3>
        <p className="text-muted" style={{ margin: 0, fontSize: '0.875rem' }}>
          Earn credits by sending USDC
        </p>
      </div>
      <div className="text-success" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
        {loading ? '...' : `${credits.toLocaleString()}`}
      </div>
    </div>
  )
}

// Export a simple version for header use
export function UserCreditsSimple() {
  const { address: evmAddress } = useAccount()
  const { address: solanaAddress, isConnected } = useAppKitAccount()
  
  const activeAddress = (evmAddress || solanaAddress)?.toLowerCase()
  const [credits, setCredits] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchCredits() {
      if (!isConnected || !activeAddress) {
        setCredits(0)
        return
      }

      setLoading(true)
      const { data } = await supabase
        .from('user_credits')
        .select('credits')
        .eq('wallet_address', activeAddress)
        .single()

      if (data) {
        setCredits(data.credits)
      } else {
        setCredits(0)
      }
      setLoading(false)
    }

    fetchCredits()
  }, [isConnected, activeAddress])

  if (!isConnected) return null

  return <span>{loading ? '...' : `${credits.toLocaleString()} Credits`}</span>
}