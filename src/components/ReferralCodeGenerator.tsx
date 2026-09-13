
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

const QUALIFICATION_AMOUNT = 30

interface ReferralCodeGeneratorProps {
  className?: string
}

export function ReferralCodeGenerator({
  className = '',
}: ReferralCodeGeneratorProps) {
  // chainId removed because useAppKitAccount() does not provide it
  const { address, isConnected } = useAppKitAccount()

  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [qualifies, setQualifies] = useState(false)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [totalSpent, setTotalSpent] = useState(0)
  const [copied, setCopied] = useState<'code' | 'link' | null>(null)
  const [error, setError] = useState<string | null>(null)

  /**
   * Wallet addresses:
   *
   * EVM addresses are case-insensitive.
   * Solana addresses are case-sensitive.
   *
   * Since this component does not currently have chainId,
   * keep the address exactly as returned by AppKit.
   */
  const normalizedAddress = address;

  useEffect(() => {
    let cancelled = false

    async function checkQualification() {
      if (!isConnected || !normalizedAddress) {
        if (!cancelled) {
          setQualifies(false)
          setReferralCode(null)
          setTotalSpent(0)
          setLoading(false)
        }

        return
      }

      if (!supabase) {
        if (!cancelled) {
          setError(
            'Supabase is not configured. Please check your environment variables.'
          )
          setLoading(false)
        }

        return
      }

      setLoading(true)
      setError(null)

      try {
        // Check if transactions table exists
        const { error: tableCheckError } = await supabase
          .from('transactions')
          .select('amount')
          .limit(1)

        if (tableCheckError) {
          console.error('Transactions table not found:', tableCheckError)
          setError('Database tables not set up. Please run the SQL setup script.')
          setLoading(false)
          return
        }

        const { data: transactions, error: transactionsError } =
          await supabase
            .from('transactions')
            .select('amount')
            .eq('sender_address', normalizedAddress)
            .eq('status', 'SUCCESS')

        if (transactionsError) {
          throw new Error(transactionsError.message)
        }

        const total =
          transactions?.reduce(
            (sum, transaction) => sum + Number(transaction.amount || 0),
            0
          ) || 0

        const isQualified = total >= QUALIFICATION_AMOUNT

        if (cancelled) return

        setTotalSpent(total)
        setQualifies(isQualified)

        const { data: existingCode, error: codeError } = await supabase
          .from('referral_codes')
          .select('code')
          .eq('referrer_wallet_address', normalizedAddress)
          .maybeSingle()

        if (codeError) {
          throw new Error(codeError.message)
        }

        if (!cancelled) {
          setReferralCode(existingCode?.code || null)
        }
      } catch (err) {
        console.error(
          'Failed to check referral qualification:',
          err
        )

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load referral information.'
          )
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    checkQualification()

    return () => {
      cancelled = true
    }
  }, [isConnected, normalizedAddress])

  const generateCode = async () => {
    if (!normalizedAddress || !supabase) return

    setGenerating(true)
    setError(null)

    try {
      // Check if referral_codes table exists
      const { error: tableCheckError } = await supabase
        .from('referral_codes')
        .select('code')
        .limit(1)

      if (tableCheckError) {
        console.error('Referral table not found:', tableCheckError)
        setError('Referral system not set up. Please run the SQL setup script in Supabase.')
        setGenerating(false)
        return
      }

      /**
       * Prefer the database RPC because uniqueness should ultimately
       * be enforced by the database, not the browser.
       */
      const { data: generatedCode, error: rpcError } =
        await supabase.rpc('generate_referral_code')

      let newCode: string | null = null

      if (!rpcError && generatedCode) {
        newCode = String(generatedCode)
      } else {
        /**
         * Fallback for installations where the RPC isn't available.
         *
         * The database should still have a UNIQUE constraint
         * on the `code` column.
         */
        const chars =
          'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

        for (let attempt = 0; attempt < 10; attempt++) {
          let candidate = ''

          for (let i = 0; i < 8; i++) {
            candidate += chars.charAt(
              Math.floor(Math.random() * chars.length)
            )
          }

          const {
            data: existingCode,
            error: lookupError,
          } = await supabase
            .from('referral_codes')
            .select('code')
            .eq('code', candidate)
            .maybeSingle()

          if (lookupError) {
            throw new Error(lookupError.message)
          }

          if (!existingCode) {
            newCode = candidate
            break
          }
        }
      }

      if (!newCode) {
        throw new Error(
          'Could not generate a unique referral code. Please try again.'
        )
      }

      const {
        data: insertedCode,
        error: insertError,
      } = await supabase
        .from('referral_codes')
        .insert({
          code: newCode,
          referrer_wallet_address: normalizedAddress,
          is_active: true,
        })
        .select('code')
        .single()

      if (insertError) {
        /**
         * This can happen if the user clicked twice or another
         * request generated the same code at nearly the same time.
         */
        if (insertError.code === '23505') {
          throw new Error(
            'This referral code was already taken. Please generate another one.'
          )
        }

        throw new Error(insertError.message)
      }

      setReferralCode(
        insertedCode?.code || newCode
      )
    } catch (err) {
      console.error(
        'Failed to generate referral code:',
        err
      )

      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate your referral code.'
      )
    } finally {
      setGenerating(false)
    }
  }

  const referralLink =
    referralCode &&
    typeof window !== 'undefined'
      ? `${window.location.origin}/?ref=${encodeURIComponent(
          referralCode
        )}`
      : ''

  const copyText = async (
    type: 'code' | 'link'
  ) => {
    const value =
      type === 'code'
        ? referralCode
        : referralLink

    if (!value) return

    try {
      await navigator.clipboard.writeText(value)

      setCopied(type)

      window.setTimeout(() => {
        setCopied(null)
      }, 2000)
    } catch (err) {
      console.error(
        'Failed to copy:',
        err
      )

      setError(
        'Could not copy to clipboard. Please copy it manually.'
      )
    }
  }

  const progress = Math.min(
    100,
    (totalSpent / QUALIFICATION_AMOUNT) * 100
  )

  const remaining = Math.max(
    0,
    QUALIFICATION_AMOUNT - totalSpent
  )

  if (!isConnected) {
    return (
      <section
        className={`referral-generator referral-generator-empty ${className}`}
      >
        <div className="referral-generator-icon">
          ↗
        </div>

        <div className="referral-generator-content">
          <span className="referral-eyebrow">
            REFERRAL PROGRAM
          </span>

          <h2>
            Unlock Referral Rewards
          </h2>

          <p>
            Connect your wallet to check your eligibility
            and start earning referral rewards.
          </p>
        </div>
      </section>
    )
  }

  if (loading) {
    return (
      <section
        className={`referral-generator ${className}`}
      >
        <div className="referral-generator-header">
          <div>
            <span className="referral-eyebrow">
              REFERRAL PROGRAM
            </span>

            <h2>
              Referral Rewards
            </h2>
          </div>

          <div className="referral-loading-dot">
            <span />
            Loading
          </div>
        </div>

        <div className="referral-skeleton">
          <div className="skeleton-line skeleton-title" />
          <div className="skeleton-line" />
          <div className="skeleton-box" />
        </div>
      </section>
    )
  }

  if (
    error &&
    !qualifies &&
    totalSpent === 0
  ) {
    return (
      <section
        className={`referral-generator ${className}`}
      >
        <div className="referral-generator-header">
          <div>
            <span className="referral-eyebrow">
              REFERRAL PROGRAM
            </span>

            <h2>
              Referral Rewards
            </h2>
          </div>
        </div>

        <div className="referral-error">
          <span className="referral-error-icon">
            !
          </span>

          <div>
            <strong>
              Unable to load referral status
            </strong>

            <p>
              {error}
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (!qualifies) {
    return (
      <section
        className={`referral-generator ${className}`}
      >
        <div className="referral-generator-header">
          <div>
            <span className="referral-eyebrow">
              REFERRAL PROGRAM
            </span>

            <h2>
              Unlock{' '}
              <span>
                Referral Rewards
              </span>
            </h2>

            <p>
              Purchase at least $30 worth of USDC
              to unlock your personal referral code.
            </p>
          </div>

          <div className="referral-lock-icon">
            🔒
          </div>
        </div>

        <div className="qualification-card">
          <div className="qualification-top">
            <div>
              <span className="qualification-label">
                Qualification progress
              </span>

              <strong>
                ${totalSpent.toFixed(2)}

                <small>
                  {' '}
                  / $
                  {QUALIFICATION_AMOUNT.toFixed(2)}
                </small>
              </strong>
            </div>

            <span className="qualification-percent">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="qualification-track">
            <div
              className="qualification-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <div className="qualification-bottom">
            <span>
              {remaining > 0
                ? `$${remaining.toFixed(
                    2
                  )} more to unlock`
                : 'Qualification reached'}
            </span>

            <span>
              Minimum $30
            </span>
          </div>
        </div>

        <div className="referral-benefits">
          <div className="benefit">
            <span className="benefit-icon">
              20%
            </span>

            <div>
              <strong>
                Earn 20% in points
              </strong>

              <p>
                Receive points based on your
                referrals&apos; purchases.
              </p>
            </div>
          </div>

          <div className="benefit">
            <span className="benefit-icon">
              10%
            </span>

            <div>
              <strong>
                Give your friends 10%
              </strong>

              <p>
                Your referred users receive a
                bonus when they use your code.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="referral-inline-error">
            {error}
          </div>
        )}
      </section>
    )
  }

  return (
    <section
      className={`referral-generator referral-generator-qualified ${className}`}
    >
      <div className="referral-generator-header">
        <div>
          <div className="referral-status">
            <span className="status-dot" />
            Eligible
          </div>

          <span className="referral-eyebrow">
            REFERRAL PROGRAM
          </span>

          <h2>
            Your Referral{' '}
            <span>Code</span>
          </h2>

          <p>
            Invite friends, grow the community,
            and earn points from their qualifying
            purchases.
          </p>
        </div>

        <div className="referral-reward-badge">
          <strong>
            20%
          </strong>

          <span>
            Referral reward
          </span>
        </div>
      </div>

      {referralCode ? (
        <>
          <div className="referral-code-card">
            <div className="referral-code-label">
              YOUR UNIQUE CODE
            </div>

            <div className="referral-code">
              {referralCode}
            </div>

            <button
              type="button"
              onClick={() =>
                copyText('code')
              }
              className="copy-code-button"
            >
              <span>
                {copied === 'code'
                  ? '✓'
                  : '⧉'}
              </span>

              {copied === 'code'
                ? 'Copied'
                : 'Copy Code'}
            </button>
          </div>

          <div className="referral-link-row">
            <div className="referral-link-content">
              <span className="referral-link-icon">
                ↗
              </span>

              <div>
                <span>
                  SHAREABLE REFERRAL LINK
                </span>

                <strong>
                  {referralLink}
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                copyText('link')
              }
              className="copy-link-button"
            >
              {copied === 'link'
                ? 'Copied'
                : 'Copy Link'}
            </button>
          </div>

          <div className="referral-rewards-grid">
            <div className="reward-card">
              <div className="reward-icon reward-icon-primary">
                20%
              </div>

              <div>
                <strong>
                  You earn
                </strong>

                <p>
                  Earn 20% of your referred
                  users&apos; qualifying purchase
                  value in points.
                </p>
              </div>
            </div>

            <div className="reward-card">
              <div className="reward-icon">
                10%
              </div>

              <div>
                <strong>
                  Friends receive
                </strong>

                <p>
                  Your friends receive a 10%
                  bonus when they join through
                  your referral.
                </p>
              </div>
            </div>
          </div>

          <div className="referral-footer-note">
            <span>✦</span>

            Track referrals, purchases,
            and earned points from your
            Referral Stats dashboard.
          </div>

          {error && (
            <div className="referral-inline-error">
              {error}
            </div>
          )}
        </>
      ) : (
        <div className="generate-referral-card">
          <div className="generate-referral-icon">
            ✦
          </div>

          <div className="generate-referral-content">
            <h3>
              You&apos;re qualified!
            </h3>

            <p>
              Your purchases have reached
              the $30 minimum. Generate your
              unique referral code and start
              sharing.
            </p>
          </div>

          <button
            type="button"
            onClick={generateCode}
            disabled={generating}
            className="generate-referral-button"
          >
            {generating ? (
              <>
                <span className="button-spinner" />
                Generating...
              </>
            ) : (
              <>
                Generate Referral Code
                <span>→</span>
              </>
            )}
          </button>

          {error && (
            <div className="referral-inline-error">
              {error}
            </div>
          )}
        </div>
      )}
    </section>
  )
}

