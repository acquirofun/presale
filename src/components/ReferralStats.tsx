
'use client'

import { useEffect, useState } from 'react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

interface Transaction {
  amount: number
  status: string
  created_at: string
  referral_bonus_points: number
}

interface ReferredUser {
  referred_wallet_address: string
  total_referred_amount: number
  created_at: string
  transactions: Transaction[]
}

interface ReferralStatsData {
  code: string | null
  totalReferrals: number
  totalReferredAmount: number
  totalEarnings: number
  referredUsers: ReferredUser[]
}

const initialStats: ReferralStatsData = {
  code: null,
  totalReferrals: 0,
  totalReferredAmount: 0,
  totalEarnings: 0,
  referredUsers: [],
}

function shortenAddress(address: string) {
  if (!address) return 'Unknown'

  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

function formatCurrency(value: number) {
  return `$${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatDate(date: string) {
  if (!date) return 'N/A'

  return new Date(date).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function ReferralStats() {
  const { address, isConnected } = useAppKitAccount()
  const { open } = useAppKit()

  const activeAddress = address?.toLowerCase()

  const [stats, setStats] = useState<ReferralStatsData>(initialStats)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchReferralStats() {
      if (!isConnected || !activeAddress || !supabase) {
        setStats(initialStats)
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        /*
         * 1. Referral code + overview
         */
        const { data: codeData, error: codeError } =
          await supabase
            .from('referral_codes')
            .select(
              'code, total_referrals, total_referred_amount'
            )
            .eq(
              'referrer_wallet_address',
              activeAddress
            )
            .maybeSingle()

        if (codeError) {
          console.error(
            'Error fetching referral code:',
            codeError
          )
        }

        if (!codeData) {
          if (!cancelled) {
            setStats(initialStats)
          }

          return
        }

        /*
         * 2. Earnings
         */
        const { data: earningsData, error: earningsError } =
          await supabase
            .from('referral_earnings')
            .select('earned_points')
            .eq(
              'referrer_wallet_address',
              activeAddress
            )

        if (earningsError) {
          console.error(
            'Error fetching referral earnings:',
            earningsError
          )
        }

        const totalEarnings =
          earningsData?.reduce(
            (sum, earning) =>
              sum + Number(earning.earned_points || 0),
            0
          ) || 0

        /*
         * 3. Referred users
         */
        const {
          data: relationshipsData,
          error: relationshipsError,
        } = await supabase
          .from('referral_relationships')
          .select(
            'referred_wallet_address, total_referred_amount, created_at'
          )
          .eq(
            'referrer_wallet_address',
            activeAddress
          )
          .order('created_at', {
            ascending: false,
          })

        if (relationshipsError) {
          console.error(
            'Error fetching referral relationships:',
            relationshipsError
          )
        }

        let referredUsers: ReferredUser[] = []

        if (
          relationshipsData &&
          relationshipsData.length > 0
        ) {
          referredUsers = await Promise.all(
            relationshipsData.map(async (relationship) => {
              const {
                data: transactions,
                error: transactionError,
              } = await supabase
                .from('transactions')
                .select(
                  'amount, status, created_at, referral_bonus_points'
                )
                .eq(
                  'sender_address',
                  relationship.referred_wallet_address
                )
                .order('created_at', {
                  ascending: false,
                })
                .limit(5)

              if (transactionError) {
                console.error(
                  'Error fetching transactions:',
                  transactionError
                )
              }

              return {
                referred_wallet_address:
                  relationship.referred_wallet_address,
                total_referred_amount:
                  Number(
                    relationship.total_referred_amount || 0
                  ),
                created_at: relationship.created_at,
                transactions: transactions || [],
              }
            })
          )
        }

        if (!cancelled) {
          setStats({
            code: codeData.code,
            totalReferrals:
              Number(codeData.total_referrals || 0),
            totalReferredAmount:
              Number(
                codeData.total_referred_amount || 0
              ),
            totalEarnings,
            referredUsers,
          })
        }
      } catch (error) {
        console.error(
          'Failed to fetch referral statistics:',
          error
        )
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchReferralStats()

    return () => {
      cancelled = true
    }
  }, [isConnected, activeAddress])

  const copyReferralCode = async () => {
    if (!stats.code) return

    try {
      await navigator.clipboard.writeText(stats.code)

      setCopied(true)

      setTimeout(() => {
        setCopied(false)
      }, 2000)
    } catch (error) {
      console.error(
        'Failed to copy referral code:',
        error
      )
    }
  }

  /*
   * Wallet disconnected
   */
  if (!isConnected) {
    return (
      <section className="referral-stats-card referral-empty">
        <div className="referral-empty-icon">
          ↗
        </div>

        <div className="referral-empty-content">
          <span className="referral-eyebrow">
            REFERRAL PROGRAM
          </span>

          <h2>Grow your network</h2>

          <p>
            Connect your wallet to access your referral
            statistics and rewards.
          </p>

          <button
            type="button"
            className="referral-connect-button"
            onClick={() => open()}
          >
            Connect Wallet
            <span>→</span>
          </button>
        </div>
      </section>
    )
  }

  /*
   * Loading
   */
  if (loading) {
    return (
      <section className="referral-stats-card">
        <div className="referral-loading">
          <div className="referral-spinner" />

          <div>
            <strong>Loading referral data</strong>
            <span>
              Syncing your referral activity...
            </span>
          </div>
        </div>
      </section>
    )
  }

  /*
   * No referral code
   */
  if (!stats.code) {
    return (
      <section className="referral-stats-card referral-empty">
        <div className="referral-empty-icon">
          ✦
        </div>

        <div className="referral-empty-content">
          <span className="referral-eyebrow">
            REFERRAL PROGRAM
          </span>

          <h2>Start earning rewards</h2>

          <p>
            Generate your referral code and invite
            friends to start earning points.
          </p>

          <a
            href="/referral"
            className="referral-connect-button"
          >
            Generate Referral Code
            <span>→</span>
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="referral-stats-card">

      {/* Header */}
      <div className="referral-header">

        <div>
          <div className="referral-eyebrow">
            <span className="referral-live-dot" />
            REFERRAL PROGRAM
          </div>

          <h2 className="referral-title">
            Referral <span>Stats</span>
          </h2>

          <p className="referral-subtitle">
            Track your referrals, volume and earned rewards.
          </p>
        </div>

        <div className="referral-code-box">
          <span>Your Code</span>

          <div>
            <strong>{stats.code}</strong>

            <button
              type="button"
              onClick={copyReferralCode}
              title="Copy referral code"
            >
              {copied ? '✓' : '⧉'}
            </button>
          </div>
        </div>

      </div>


      {/* Overview Stats */}
      <div className="referral-overview">

        <div className="referral-stat referral-stat-primary">
          <div className="referral-stat-icon">
            👥
          </div>

          <div className="referral-stat-content">
            <span>Total Referrals</span>

            <strong>
              {stats.totalReferrals.toLocaleString()}
            </strong>

            <small>People joined</small>
          </div>
        </div>


        <div className="referral-stat">
          <div className="referral-stat-icon">
            $
          </div>

          <div className="referral-stat-content">
            <span>Referred Volume</span>

            <strong>
              {formatCurrency(
                stats.totalReferredAmount
              )}
            </strong>

            <small>USDC volume</small>
          </div>
        </div>


        <div className="referral-stat">
          <div className="referral-stat-icon">
            ✦
          </div>

          <div className="referral-stat-content">
            <span>Points Earned</span>

            <strong>
              {stats.totalEarnings.toLocaleString()}
            </strong>

            <small>Referral rewards</small>
          </div>
        </div>

      </div>


      {/* Referred Users */}
      <div className="referred-section">

        <div className="referred-section-header">
          <div>
            <h3>Referred Users</h3>

            <span>
              {stats.referredUsers.length}{' '}
              {stats.referredUsers.length === 1
                ? 'user'
                : 'users'}
            </span>
          </div>

          {stats.referredUsers.length > 0 && (
            <span className="referral-active-badge">
              ● Active
            </span>
          )}
        </div>


        {stats.referredUsers.length > 0 ? (
          <div className="referred-users-list">

            {stats.referredUsers.map(
              (user, index) => (
                <div
                  className="referred-user"
                  key={`${user.referred_wallet_address}-${index}`}
                >

                  {/* User Header */}
                  <div className="referred-user-header">

                    <div className="referred-user-identity">

                      <div className="referred-avatar">
                        {shortenAddress(
                          user.referred_wallet_address
                        ).slice(0, 2)}
                      </div>

                      <div>
                        <strong>
                          {shortenAddress(
                            user.referred_wallet_address
                          )}
                        </strong>

                        <span>
                          Joined{' '}
                          {formatDate(
                            user.created_at
                          )}
                        </span>
                      </div>

                    </div>


                    <div className="referred-total">
                      <strong>
                        {formatCurrency(
                          user.total_referred_amount
                        )}
                      </strong>

                      <span>Referred volume</span>
                    </div>

                  </div>


                  {/* Transactions */}
                  {user.transactions &&
                    user.transactions.length > 0 && (
                      <div className="transaction-section">

                        <div className="transaction-heading">
                          Recent transactions
                        </div>

                        {user.transactions.map(
                          (tx, txIndex) => {
                            const isSuccess =
                              tx.status === 'SUCCESS'

                            return (
                              <div
                                className="transaction-row"
                                key={`${tx.created_at}-${txIndex}`}
                              >

                                <div className="transaction-info">

                                  <span className="transaction-amount">
                                    {formatCurrency(
                                      Number(
                                        tx.amount || 0
                                      )
                                    )}{' '}
                                    USDC
                                  </span>

                                  {Number(
                                    tx.referral_bonus_points ||
                                      0
                                  ) > 0 && (
                                    <span className="transaction-bonus">
                                      +{' '}
                                      {Number(
                                        tx.referral_bonus_points
                                      ).toLocaleString()}{' '}
                                      bonus
                                    </span>
                                  )}

                                </div>

                                <div
                                  className={`transaction-status ${
                                    isSuccess
                                      ? 'success'
                                      : 'pending'
                                  }`}
                                >
                                  <span>●</span>

                                  {tx.status}
                                </div>

                              </div>
                            )
                          }
                        )}

                      </div>
                    )}

                </div>
              )
            )}

          </div>
        ) : (
          <div className="no-referrals">
            <div className="no-referrals-icon">
              ↗
            </div>

            <strong>
              No referrals yet
            </strong>

            <span>
              Share your referral code to start earning
              rewards.
            </span>

            <button
              type="button"
              onClick={copyReferralCode}
            >
              {copied
                ? '✓ Code Copied'
                : 'Copy Referral Code'}
            </button>
          </div>
        )}

      </div>

    </section>
  )
}
