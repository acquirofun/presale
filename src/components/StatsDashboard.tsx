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
  const [userTransactions, setUserTransactions] = useState<{ amount: number; chain: string; status: string; created_at: string }[]>([])
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
      }

      setLoading(false)
    }

    fetchStats()
  }, [isConnected, address])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
      {/* Total Raised Card */}
      <div className="card">
        <h3 className="text-center">Total Raised</h3>
        <div className="text-center" style={{ fontSize: '2.5rem', fontWeight: '700', color: 'var(--primary)' }}>
          ${loading ? '...' : totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-center text-muted" style={{ fontSize: '0.875rem' }}>
          USDC
        </div>
      </div>

      {/* Transaction History Card */}
      <div className="card">
        <h3 className="text-center">Transaction History</h3>
        
        {!isConnected ? (
          <div className="text-center" style={{ padding: 'var(--spacing-lg)' }}>
            <p className="text-muted">Connect your wallet to view your transactions</p>
          </div>
        ) : userTransactions.length === 0 ? (
          <div className="text-center" style={{ padding: 'var(--spacing-lg)' }}>
            <p className="text-muted">No transactions yet</p>
          </div>
        ) : (
          <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
            {userTransactions.map((tx, index) => (
              <div 
                key={index}
                style={{ 
                  padding: 'var(--spacing-sm)', 
                  borderBottom: '1px solid var(--card-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: '600' }}>
                    {tx.amount} USDC
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                    {tx.chain}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div 
                    className={tx.status === 'SUCCESS' ? 'text-success' : 'text-error'}
                    style={{ fontSize: '0.75rem', fontWeight: '600' }}
                  >
                    {tx.status}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.75rem' }}>
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