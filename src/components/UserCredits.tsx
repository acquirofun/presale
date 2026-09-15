
'use client'

import { useEffect, useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

const REFERRAL_MINIMUM = 30

function useUserCredits(includeQualification = false) {
  const { address, isConnected } = useAppKitAccount()

  const [credits, setCredits] = useState(0)
  const [qualifies, setQualifies] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      if (!isConnected || !address) {
        if (!cancelled) {
          setCredits(0)
          setQualifies(false)
          setLoading(false)
        }
        return
      }

      if (!supabase) {
        console.error(
          'Supabase is not configured. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_KEY.'
        )

        if (!cancelled) {
          setCredits(0)
          setQualifies(false)
          setLoading(false)
        }

        return
      }

      setLoading(true)

      try {
        /*
         * Wallet addresses should ideally be stored in a consistent
         * format in the database.
         *
         * For EVM addresses, lowercase normalization is safe.
         * Don't blindly lowercase Solana Base58 addresses.
         */
        const walletAddress = address.toLowerCase()

        // ---------------------------------------------------------
        // Fetch user credits
        // ---------------------------------------------------------

        const { data: creditData, error: creditError } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('wallet_address', walletAddress)
          .maybeSingle()

        if (creditError) {
          throw new Error(creditError.message)
        }

        const userCredits = Number(creditData?.credits || 0)

        if (!cancelled) {
          setCredits(userCredits)
        }

        // ---------------------------------------------------------
        // Check referral qualification
        // ---------------------------------------------------------

        if (includeQualification) {
          const { data: transactions, error: transactionError } =
            await supabase
              .from('transactions')
              .select('amount')
              .eq('sender_address', walletAddress)
              .eq('status', 'SUCCESS')

          if (transactionError) {
            throw new Error(transactionError.message)
          }

          const totalSpent =
            transactions?.reduce(
              (sum, transaction) =>
                sum + Number(transaction.amount || 0),
              0
            ) || 0

          if (!cancelled) {
            setQualifies(totalSpent >= REFERRAL_MINIMUM)
          }
        }
      } catch (error) {
        console.error('Failed to fetch user credits:', error)

        if (!cancelled) {
          setCredits(0)

          if (includeQualification) {
            setQualifies(false)
          }
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [address, isConnected, includeQualification])

  return {
    credits,
    qualifies,
    loading,
    isConnected,
  }
}

/* =========================================================
   FULL CREDITS CARD
   ========================================================= */

export function UserCredits() {
  const { credits, loading, isConnected } = useUserCredits(false)

  if (!isConnected) return null

  return (
    <section className="user-credits-card">
      <div className="user-credits-info">
        <div className="user-credits-icon">
          ✦
        </div>

        <div>
          <span className="user-credits-eyebrow">
            REWARD BALANCE
          </span>

          <h3>My Credits</h3>

          <p style={{color: "red"}}>See Dashboard for Estimated Profit
          </p>
        </div>
      </div>

      <div className="user-credits-value">
        {loading ? (
          <span className="credits-loading">...</span>
        ) : (
          <>
            <strong>
              {credits.toLocaleString()}
            </strong>

            <span>Credits</span>
          </>
        )}
      </div>
    </section>
  )
}

/* =========================================================
   DASHBOARD VERSION WITH REFERRAL QUALIFICATION
   ========================================================= */

export function UserCreditsWithReferral() {
  const {
    credits,
    qualifies,
    loading,
    isConnected,
  } = useUserCredits(true)

  if (!isConnected) return null

  return (
    <section className="user-credits-card user-credits-dashboard">
      <div className="user-credits-main">
        <div className="user-credits-info">
          <div className="user-credits-icon">
            ✦
          </div>

          <div>
            <span className="user-credits-eyebrow">
              REWARD BALANCE
            </span>

            <h3>My Credits</h3>

            <p>
              Earn credits by sending USDC
            </p>

            {qualifies && !loading && (
              <div className="referral-qualified-badge">
                <span>✓</span>
                Referral unlocked
              </div>
            )}
          </div>
        </div>

        <div className="user-credits-value">
          {loading ? (
            <span className="credits-loading">...</span>
          ) : (
            <>
              <strong>
                {credits.toLocaleString()}
              </strong>

              <span>Credits</span>
            </>
          )}
        </div>
      </div>

      {qualifies && !loading && (
        <div className="credits-referral-banner">
          <div className="credits-referral-icon">
            ↗
          </div>

          <div>
            <strong>
              You&apos;re eligible for the referral program
            </strong>

            <p>
              Generate your referral code and start earning
              points from your referrals.
            </p>
          </div>
        </div>
      )}
    </section>
  )
}

/* =========================================================
   HEADER / COMPACT VERSION
   ========================================================= */

export function UserCreditsSimple() {
  const {
    credits,
    loading,
    isConnected,
  } = useUserCredits(false)

  if (!isConnected) return null

  return (
    <span className="user-credits-simple">
      <span className="credits-mini-icon">
        ✦
      </span>

      <span className="credits-mini-value">
        {loading
          ? '...'
          : credits.toLocaleString()}
      </span>

      <span className="credits-mini-label">
        Credits
      </span>
    </span>
  )
}

