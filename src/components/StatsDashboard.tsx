'use client'

import { useState, useEffect } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || "https://kifydthslaqeqmohvetb.supabase.co", 
  process.env.SUPABASE_KEY || "sb_publishable_gPldRZjoctXxbEuEmy1GjA_EjzSLjqk"
)

export function StatsDashboard() {
  const { isConnected, address } = useAppKitAccount()
  const [totalRaised, setTotalRaised] = useState<number>(0)
  const [userTransactions, setUserTransactions] = useState<{ amount: number; chain: string; status: string; created_at: string; referral_bonus_points: number }[]>([])
  const [referralEarnings, setReferralEarnings] = useState<number>(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function fetchStats() {
      setLoading(true)

      // Fetch total USDC raised across all users
      const { data: allTxData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'SUCCESS')

      if (allTxData) {
        const total = allTxData.reduce((sum, tx) => sum + tx.amount, 0)
        setTotalRaised(total)
      }

      // Fetch user's transaction history
      if (isConnected && address) {
        const { data: userTxData } = await supabase
          .from('transactions')
          .select('*')
          .eq('sender_address', address.toLowerCase())
          .order('created_at', { ascending: false })
          .limit(10)

        if (userTxData) {
          setUserTransactions(userTxData)
        }

        // Fetch user's referral earnings
        const { data: earningsData } = await supabase
          .from('referral_earnings')
          .select('earned_points')
          .eq('referrer_wallet_address', address.toLowerCase())

        const totalPoints = earningsData?.reduce((sum, earning) => sum + earning.earned_points, 0) || 0
        setReferralEarnings(totalPoints)
      }

      setLoading(false)
    }

    fetchStats()
  }, [isConnected, address])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)', width: '100%' }}>
      {/* Total Raised Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <span className="text-muted" style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Global Metric</span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 750, marginTop: '2px', marginBottom: '16px' }}>Total Raised</h3>
        </div>
        <div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1, letterSpacing: '-1px' }}>
            ${loading ? '...' : totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            USDC Value
          </div>
        </div>
      </div>

      {/* Referral Earnings Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <span className="text-muted" style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Rewards</span>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 750, marginTop: '2px', marginBottom: '16px' }}>Referral Earnings</h3>
        </div>
        <div>
          <div style={{ fontSize: '2.25rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1, letterSpacing: '-1px' }}>
            {loading ? '...' : referralEarnings.toLocaleString()}
          </div>
          <div className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600, marginTop: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            Total Points
          </div>
        </div>
      </div>

      {/* Transaction History Card */}
      <div className="card" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 750 }}>Transaction History</h3>
          {isConnected && userTransactions.length > 0 && (
            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--primary)', background: 'rgba(0, 212, 170, 0.08)', padding: '4px 8px', borderRadius: '6px' }}>
              Latest {userTransactions.length}
            </span>
          )}
        </div>
        
        {!isConnected ? (
          <div className="text-center" style={{ padding: 'var(--spacing-xl) var(--spacing-md)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.08)' }}>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Connect your wallet to view your transactions</p>
          </div>
        ) : userTransactions.length === 0 ? (
          <div className="text-center" style={{ padding: 'var(--spacing-xl) var(--spacing-md)', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.08)' }}>
            <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>No transactions yet</p>
          </div>
        ) : (
          <div style={{ maxHeight: '240px', overflowY: 'auto', paddingRight: '4px' }} className="referred-users-list">
            {userTransactions.map((tx, index) => (
              <div 
                key={index}
                style={{ 
                  padding: '12px 14px', 
                  marginBottom: '8px',
                  background: 'rgba(0, 0, 0, 0.16)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  borderRadius: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-primary)' }}>
                    {tx.amount} USDC
                    {tx.referral_bonus_points > 0 && (
                      <span className="text-success" style={{ marginLeft: '6px', fontSize: '0.7rem', fontWeight: '700', background: 'rgba(0, 212, 170, 0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                        +{tx.referral_bonus_points} bonus
                      </span>
                    )}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {tx.chain}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div 
                    className={tx.status === 'SUCCESS' ? 'text-success' : 'text-error'}
                    style={{ fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.5px' }}
                  >
                    {tx.status}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.7rem', marginTop: '2px' }}>
                    {new Date(tx.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}