// src/components/ReferralStats.tsx
'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useAppKitAccount } from '@reown/appkit/react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || "https://kifydthslaqeqmohvetb.supabase.co",
  process.env.SUPABASE_KEY || "sb_publishable_gPldRZjoctXxbEuEmy1GjA_EjzSLjqk"
)

export function ReferralStats() {
  const { address: evmAddress } = useAccount()
  const { address: solanaAddress, isConnected } = useAppKitAccount()

  const activeAddress = (evmAddress || solanaAddress)?.toLowerCase()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [totalReferrals, setTotalReferrals] = useState<number>(0)
  const [totalReferredAmount, setTotalReferredAmount] = useState<number>(0)
  const [totalEarnings, setTotalEarnings] = useState<number>(0)
  const [referredUsers, setReferredUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchReferralStats() {
      if (!isConnected || !activeAddress) {
        return
      }

      setLoading(true)

      try {
        // Get referral code
        const { data: codeData } = await supabase
          .from('referral_codes')
          .select('code, total_referrals, total_referred_amount')
          .eq('referrer_wallet_address', activeAddress)
          .single()

        if (codeData) {
          setReferralCode(codeData.code)
          setTotalReferrals(codeData.total_referrals)
          setTotalReferredAmount(codeData.total_referred_amount)
        }

        // Get total earnings
        const { data: earningsData } = await supabase
          .from('referral_earnings')
          .select('earned_points')
          .eq('referrer_wallet_address', activeAddress)

        const totalPoints = earningsData?.reduce((sum, earning) => sum + earning.earned_points, 0) || 0
        setTotalEarnings(totalPoints)

        // Get referred users with their transactions
        const { data: relationshipsData } = await supabase
          .from('referral_relationships')
          .select('referred_wallet_address, total_referred_amount, created_at')
          .eq('referrer_wallet_address', activeAddress)

        if (relationshipsData) {
          // For each referred user, get their transaction history
          const usersWithTransactions = await Promise.all(
            relationshipsData.map(async (rel) => {
              const { data: txData } = await supabase
                .from('transactions')
                .select('amount, status, created_at, referral_bonus_points')
                .eq('sender_address', rel.referred_wallet_address)
                .order('created_at', { ascending: false })
                .limit(5)

              return {
                ...rel,
                transactions: txData || []
              }
            })
          )

          setReferredUsers(usersWithTransactions)
        }
      } catch (error) {
        console.error('Failed to fetch referral stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReferralStats()
  }, [isConnected, activeAddress])

  if (!isConnected) {
    return (
      <div className="card" style={{ padding: 'var(--spacing-md)' }}>
        <h3>Referral Stats</h3>
        <p className="text-muted">Connect your wallet to view your referral stats</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card" style={{ padding: 'var(--spacing-md)' }}>
        <h3>Referral Stats</h3>
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  if (!referralCode) {
    return (
      <div className="card" style={{ padding: 'var(--spacing-md)' }}>
        <h3>Referral Stats</h3>
        <p className="text-muted">Generate a referral code to start tracking stats</p>
      </div>
    )
  }

  return (
    <div className="card" style={{ padding: 'var(--spacing-md)' }}>
      <h3>Referral Stats</h3>

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)' }}>
            Total Referrals
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
            {totalReferrals}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)' }}>
            Total Referred
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
            ${totalReferredAmount.toFixed(2)}
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)' }}>
            Points Earned
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)' }}>
            {totalEarnings.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Referred Users List */}
      {referredUsers.length > 0 ? (
        <div>
          <h4 style={{ fontSize: '1rem', marginBottom: 'var(--spacing-md)' }}>Referred Users</h4>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {referredUsers.map((user, index) => (
              <div
                key={index}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--card-border)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 'var(--spacing-md)',
                  marginBottom: 'var(--spacing-sm)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--spacing-sm)' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                      {user.referred_wallet_address.slice(0, 6)}...{user.referred_wallet_address.slice(-4)}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Referred: {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--primary)' }}>
                      ${user.total_referred_amount.toFixed(2)}
                    </div>
                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                      Total
                    </div>
                  </div>
                </div>

                {/* User's Transactions */}
                {user.transactions.length > 0 && (
                  <div style={{ marginTop: 'var(--spacing-sm)', paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--card-border)' }}>
                    <div className="text-muted" style={{ fontSize: '0.75rem', marginBottom: 'var(--spacing-xs)' }}>
                      Recent Transactions:
                    </div>
                    {user.transactions.map((tx: any, txIndex: number) => (
                      <div
                        key={txIndex}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          marginBottom: 'var(--spacing-xs)'
                        }}
                      >
                        <span>
                          ${tx.amount} USDC
                          {tx.referral_bonus_points > 0 && (
                            <span className="text-success" style={{ marginLeft: '4px' }}>
                              (+{tx.referral_bonus_points} bonus)
                            </span>
                          )}
                        </span>
                        <span className={tx.status === 'SUCCESS' ? 'text-success' : 'text-error'}>
                          {tx.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-muted">No referred users yet. Share your referral code to start earning!</p>
      )}
    </div>
  )
}
