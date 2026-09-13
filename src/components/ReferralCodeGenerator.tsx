// src/components/ReferralCodeGenerator.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAppKitAccount } from '@reown/appkit/react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || "https://kifydthslaqeqmohvetb.supabase.co",
  process.env.SUPABASE_KEY || "sb_publishable_gPldRZjoctXxbEuEmy1GjA_EjzSLjqk"
)

export function ReferralCodeGenerator() {
  const { address: evmAddress } = useAccount()
  const { address: solanaAddress, isConnected } = useAppKitAccount()

  const activeAddress = (evmAddress || solanaAddress)?.toLowerCase()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [qualifies, setQualifies] = useState<boolean>(false)
  const [loading, setLoading] = useState(false)
  const [totalSpent, setTotalSpent] = useState<number>(0)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function checkQualification() {
      if (!isConnected || !activeAddress) {
        setQualifies(false)
        return
      }

      setLoading(true)

      // Check total spent
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('sender_address', activeAddress)
        .eq('status', 'SUCCESS')

      const total = transactions?.reduce((sum, tx) => sum + tx.amount, 0) || 0
      setTotalSpent(total)
      setQualifies(total >= 30)

      // Check if user already has a referral code
      const { data: existingCode } = await supabase
        .from('referral_codes')
        .select('code')
        .eq('referrer_wallet_address', activeAddress)
        .single()

      if (existingCode) {
        setReferralCode(existingCode.code)
      }

      setLoading(false)
    }

    checkQualification()
  }, [isConnected, activeAddress])

  const generateCode = async () => {
    if (!activeAddress) return

    setLoading(true)

    try {
      // Call the SQL function to generate a unique code
      const { data: codeData, error } = await supabase
        .rpc('generate_referral_code')

      if (error) throw error

      const newCode = codeData

      // Insert the referral code
      const { error: insertError } = await supabase
        .from('referral_codes')
        .insert({
          code: newCode,
          referrer_wallet_address: activeAddress,
          is_active: true
        })

      if (insertError) throw insertError

      setReferralCode(newCode)
    } catch (error) {
      console.error('Failed to generate referral code:', error)
      alert('Failed to generate referral code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isConnected) {
    return (
      <div className="card" style={{ padding: 'var(--spacing-md)' }}>
        <h3>Referral Program</h3>
        <p className="text-muted">Connect your wallet to join the referral program</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card" style={{ padding: 'var(--spacing-md)' }}>
        <h3>Referral Program</h3>
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  if (!qualifies) {
    return (
      <div className="card" style={{ padding: 'var(--spacing-md)' }}>
        <h3>Referral Program</h3>
        <p className="text-muted" style={{ marginBottom: 'var(--spacing-sm)' }}>
          Unlock your referral code by purchasing at least $30 worth of USDC
        </p>
        <div style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--primary)' }}>
          ${totalSpent.toFixed(2)} / $30.00
        </div>
        <div className="text-muted" style={{ fontSize: '0.875rem' }}>
          ${Math.max(0, 30 - totalSpent).toFixed(2)} more to go
        </div>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: 'var(--spacing-md)' }}>
      <h3>Your Referral Code</h3>

      {referralCode ? (
        <div>
          <div style={{
            background: 'var(--card-bg)',
            border: '2px solid var(--primary)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-md)',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'var(--primary)',
              letterSpacing: '2px',
              marginBottom: 'var(--spacing-sm)'
            }}>
              {referralCode}
            </div>
            <button
              onClick={copyToClipboard}
              className="secondary"
              style={{ fontSize: '0.875rem', padding: '8px 16px' }}
            >
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <p style={{ marginBottom: 'var(--spacing-xs)' }}>
              <strong>Share this code with friends and earn 20% of their purchase in points!</strong>
            </p>
            <p style={{ marginBottom: 'var(--spacing-xs)' }}>
              • Your friends get 10% bonus points when they use your code
            </p>
            <p>
              • Track your referrals and earnings in the stats dashboard
            </p>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-muted" style={{ marginBottom: 'var(--spacing-md)' }}>
            You qualify for a referral code! Generate one now to start earning.
          </p>
          <button
            onClick={generateCode}
            disabled={loading}
            className="primary"
            style={{ width: '100%' }}
          >
            {loading ? 'Generating...' : 'Generate Referral Code'}
          </button>
        </div>
      )}
    </div>
  )
}
