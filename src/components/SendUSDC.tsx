
// src/components/SendUSDC.tsx
'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  useAccount,
  useWaitForTransactionReceipt,
  useWriteContract,
} from 'wagmi'
import { parseUnits } from 'viem'
import { useAppKitAccount } from '@reown/appkit/react'
import { createClient } from '@supabase/supabase-js'

import { calculateCurrentRate } from '@/utils/rateCalculator'
import { ConnectButton } from '@/components/ConnectButton'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

const MIN_USDC_AMOUNT = 5

const ERC20_ABI = [
  {
    name: 'transfer',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'value', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const

const USDC_CONTRACTS: Record<
  number,
  {
    address: `0x${string}`
    decimals: number
    network: string
    token: 'USDC'
  }
> = {
  8453: {
    network: 'Base',
    token: 'USDC',
    address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    decimals: 6,
  },

  137: {
    network: 'Polygon',
    token: 'USDC',
    address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    decimals: 6,
  },

  56: {
    network: 'BSC',
    token: 'USDC',
    address: '0x8AC76a51cc950d9822d68b83fe1ad97b32cd580d',
    decimals: 18,
  },
}

const EVM_DESTINATION = process.env
  .NEXT_PUBLIC_WALLET as `0x${string}` | undefined

function normalizeWallet(address: string) {
  return address.toLowerCase()
}

async function awardCredits(
  walletAddress: string,
  usdcAmount: number,
  rate: number,
  bonusPoints = 0
) {
  if (!supabase) {
    throw new Error('Supabase is not configured.')
  }

  const cleanAddress = normalizeWallet(walletAddress)

  const creditsEarned =
    Math.floor(usdcAmount * rate) + bonusPoints

  const { error: tableCheckError } = await supabase
    .from('user_credits')
    .select('credits')
    .limit(1)

  if (tableCheckError) {
    console.error(
      'user_credits table not found:',
      tableCheckError
    )

    throw new Error(
      'Credits table not set up. Please run the SQL setup script.'
    )
  }

  const { data: existingUser, error: fetchError } =
    await supabase
      .from('user_credits')
      .select('credits')
      .eq('wallet_address', cleanAddress)
      .maybeSingle()

  if (fetchError) {
    throw new Error(
      `Failed to fetch existing credits: ${fetchError.message}`
    )
  }

  const currentCredits = Number(
    existingUser?.credits ?? 0
  )

  const newTotalCredits =
    currentCredits + creditsEarned

  const { error: upsertError } = await supabase
    .from('user_credits')
    .upsert(
      {
        wallet_address: cleanAddress,
        credits: newTotalCredits,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: 'wallet_address',
      }
    )

  if (upsertError) {
    throw new Error(
      `Failed to update credits: ${upsertError.message}`
    )
  }

  return creditsEarned
}

export function SendUSDC() {
  const {
    address,
    chainId,
    isConnected,
  } = useAccount()

  const { caipAddress } = useAppKitAccount()

  const {
    writeContractAsync,
    data: transactionHash,
    isPending: isWalletPending,
  } = useWriteContract()

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    isError: isConfirmationError,
  } = useWaitForTransactionReceipt({
    hash: transactionHash,
    confirmations: 1,
  })

  const [amount, setAmount] = useState('')

  const [currentRate, setCurrentRate] = useState(
    calculateCurrentRate().currentRate
  )

  const [referralCode, setReferralCode] = useState('')

  const [currentStep, setCurrentStep] = useState(1)

  const [isProcessing, setIsProcessing] =
    useState(false)

  const [successMessage, setSuccessMessage] =
    useState('')

  const [errorMessage, setErrorMessage] =
    useState('')

  const [pendingTransactionId, setPendingTransactionId] =
    useState<string | null>(null)

  const [
    pendingTransactionInfo,
    setPendingTransactionInfo,
  ] = useState<{
    amount: number
    rate: number
    bonusPoints: number
    referralCode: string
    referrerWallet: string | null
    basePoints: number
    walletAddress: string
  } | null>(null)

  /*
   * Prevent the confirmation effect from processing
   * the same transaction more than once.
   */
  const finalizedTransactionIdRef =
    useRef<string | null>(null)

  const isSolana =
    caipAddress?.startsWith('solana')

  const tokenConfig = useMemo(() => {
    if (!chainId) {
      return null
    }

    return USDC_CONTRACTS[chainId] ?? null
  }, [chainId])

  /*
   * Update the current rate every second.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRate(
        calculateCurrentRate().currentRate
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  /*
   * Finalize confirmed transaction.
   */
  useEffect(() => {
    if (!isConfirmed) {
      return
    }

    if (
      !pendingTransactionId ||
      !pendingTransactionInfo ||
      !transactionHash
    ) {
      return
    }

    /*
     * Prevent duplicate processing.
     */
    if (
      finalizedTransactionIdRef.current ===
      pendingTransactionId
    ) {
      return
    }

    finalizedTransactionIdRef.current =
      pendingTransactionId

    async function finalizeTransaction() {
      if (!supabase) {
        return
      }

      try {
        const {
          amount,
          rate,
          bonusPoints,
          referralCode,
          referrerWallet,
          basePoints,
          walletAddress,
        } = pendingTransactionInfo!

        /*
         * Mark transaction successful.
         */
        const { error: updateError } =
          await supabase
            .from('transactions')
            .update({
              tx_hash: transactionHash,
              status: 'SUCCESS',
            })
            .eq('id', pendingTransactionId)

        if (updateError) {
          throw new Error(
            `Failed to update transaction: ${updateError.message}`
          )
        }

        /*
         * Award buyer credits.
         */
        const earned = await awardCredits(
          walletAddress,
          amount,
          rate,
          bonusPoints
        )

        /*
         * Referral processing.
         *
         * IMPORTANT:
         * There is NO check here that prevents the same
         * wallet from using a referral code again.
         *
         * Every qualifying transaction creates its own
         * referral earning.
         */
        if (referrerWallet) {
          try {
            const {
              error: tableCheckError,
            } = await supabase
              .from('referral_relationships')
              .select('id')
              .limit(1)

            if (tableCheckError) {
              console.error(
                'Referral tables not found, skipping referral processing:',
                tableCheckError
              )
            } else {
              /*
               * Store the referral relationship for this
               * transaction.
               *
               * NOTE:
               * If your database has a UNIQUE constraint
               * on referred_wallet_address, this insert may
               * fail on the second transaction.
               *
               * That failure is intentionally ignored so
               * the referral earning can still be processed.
               */
              const {
                error: relationshipError,
              } = await supabase
                .from('referral_relationships')
                .insert({
                  referral_code:
                    referralCode || null,
                  referred_wallet_address:
                    walletAddress,
                  referrer_wallet_address:
                    normalizeWallet(referrerWallet),
                  total_referred_amount: amount,
                })

              if (relationshipError) {
                console.warn(
                  'Referral relationship insert skipped:',
                  relationshipError.message
                )
              }

              /*
               * Referrer receives 20% of the base points.
               */
              const referrerBonus =
                Math.floor(basePoints * 0.15)

              if (referrerBonus > 0) {
                /*
                 * Award referrer credits.
                 */
                await awardCredits(
                  referrerWallet,
                  0,
                  0,
                  referrerBonus
                )

                /*
                 * IMPORTANT:
                 * Every transaction gets its own
                 * referral_earnings record.
                 */
                const {
                  error: earningError,
                } = await supabase
                  .from('referral_earnings')
                  .insert({
                    referrer_wallet_address:
                      normalizeWallet(
                        referrerWallet
                      ),
                    referred_wallet_address:
                      walletAddress,
                    transaction_id:
                      pendingTransactionId,
                    earned_amount: amount,
                    earned_points:
                      referrerBonus,
                  })

                if (earningError) {
                  console.error(
                    'Failed to record referral earning:',
                    earningError.message
                  )
                }
              }
            }
          } catch (referralError) {
            console.error(
              'Referral processing failed:',
              referralError
            )

            /*
             * Referral failure must not invalidate
             * an already-confirmed blockchain payment.
             */
          }
        }

        let message =
          `✨ Transaction Confirmed Successfully!\n\n` +
          `You earned ${earned.toLocaleString()} credits.`

        if (bonusPoints > 0) {
          message +=
            `\n🎁 +${bonusPoints.toLocaleString()} referral bonus credits.`
        }

        setSuccessMessage(message)

        setAmount('')
        setReferralCode('')
        setCurrentStep(1)

        setPendingTransactionId(null)
        setPendingTransactionInfo(null)

        setIsProcessing(false)
      } catch (error) {
        console.error(
          'Failed to finalize transaction:',
          error
        )

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Failed to finalize transaction.'
        )

        setIsProcessing(false)
      }
    }

    finalizeTransaction()
  }, [
    isConfirmed,
    pendingTransactionId,
    pendingTransactionInfo,
    transactionHash,
  ])

  /*
   * Handle blockchain confirmation failure.
   */
  useEffect(() => {
    if (!isConfirmationError) {
      return
    }

    if (!pendingTransactionId || !supabase) {
      return
    }

    async function markFailed() {
      try {
        await supabase
          ?.from('transactions')
          .update({
            tx_hash: transactionHash ?? null,
            status: 'FAILED',
          })
          .eq('id', pendingTransactionId)

        setErrorMessage(
          'The blockchain transaction failed or was rejected.'
        )
      } catch (error) {
        console.error(
          'Failed to update failed transaction:',
          error
        )
      } finally {
        setIsProcessing(false)

        setPendingTransactionId(null)
        setPendingTransactionInfo(null)
      }
    }

    markFailed()
  }, [
    isConfirmationError,
    pendingTransactionId,
    transactionHash,
  ])

  /*
   * Send transaction.
   */
  const handleSend = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')

    /*
     * These local variables are important.
     *
     * React state updates are asynchronous, so relying on
     * pendingTransactionId immediately after setState()
     * can result in a stale/null value.
     */
    let createdTransactionId: string | null =
      null

    let submittedHash:
      | typeof transactionHash
      | null = null

    if (!isConnected || !address) {
      setErrorMessage(
        'Please connect your wallet first.'
      )
      return
    }

    if (!supabase) {
      setErrorMessage(
        'Supabase is not configured.'
      )
      return
    }

    if (isProcessing || isWalletPending) {
      return
    }

    const numericAmount = Number(amount)

    if (
      !amount ||
      !Number.isFinite(numericAmount) ||
      numericAmount < MIN_USDC_AMOUNT
    ) {
      setErrorMessage(
        `Minimum purchase is ${MIN_USDC_AMOUNT} USDC.`
      )
      return
    }

    if (isSolana) {
      setErrorMessage(
        'Solana payments are temporarily disabled. Please use Base, Polygon, or BSC.'
      )
      return
    }

    if (!tokenConfig) {
      setErrorMessage(
        'Please switch your network to Base, Polygon, or BSC.'
      )
      return
    }

    if (!EVM_DESTINATION) {
      setErrorMessage(
        'Payment wallet is not configured.'
      )
      return
    }

    const walletAddress =
      normalizeWallet(address)

    setIsProcessing(true)

    try {
      let referrerWallet: string | null = null

      const cleanedReferralCode =
        referralCode.trim().toUpperCase()

      /*
       * Referral validation.
       *
       * IMPORTANT:
       * We intentionally DO NOT query
       * referral_relationships here.
       *
       * Therefore:
       *
       * Transaction #1 → code works
       * Transaction #2 → same code works
       * Transaction #3 → same code works
       * Transaction #10 → same code works
       */
      if (cleanedReferralCode) {
        /*
         * Check referral code table.
         */
        const {
          error: tableCheckError,
        } = await supabase
          .from('referral_codes')
          .select('code')
          .limit(1)

        if (tableCheckError) {
          console.error(
            'Referral tables not found:',
            tableCheckError
          )

          throw new Error(
            'Referral system not set up. Please run the SQL setup script in Supabase.'
          )
        }

        /*
         * Directly validate the referral code.
         *
         * We intentionally do NOT call:
         *
         * validate_referral_code
         *
         * because your previous SQL function may contain
         * the "already used referral code" restriction.
         */
        const {
          data: codeData,
          error: codeError,
        } = await supabase
          .from('referral_codes')
          .select(
            'referrer_wallet_address'
          )
          .eq('code', cleanedReferralCode)
          .eq('is_active', true)
          .maybeSingle()

        if (codeError) {
          throw new Error(
            `Failed to validate referral code: ${codeError.message}`
          )
        }

        if (!codeData) {
          throw new Error(
            'Invalid or inactive referral code.'
          )
        }

        const codeOwner =
          normalizeWallet(
            codeData.referrer_wallet_address
          )

        /*
         * Self-referral is still forbidden.
         */
        if (codeOwner === walletAddress) {
          throw new Error(
            'You cannot use your own referral code.'
          )
        }

        referrerWallet = codeOwner
      }

      /*
       * Calculate credits.
       */
      const basePoints = Math.floor(
        numericAmount * currentRate
      )

      /*
       * Buyer receives +10% when using a valid
       * referral code.
       */
      const bonusPoints = referrerWallet
        ? Math.floor(basePoints * 0.15)
        : 0

      /*
       * Create pending transaction.
       */
      const {
        data: transaction,
        error: insertError,
      } = await supabase
        .from('transactions')
        .insert({
          sender_address: walletAddress,
          recipient_address:
            EVM_DESTINATION.toLowerCase(),
          amount: numericAmount,
          chain: tokenConfig.network,
          status: 'PENDING',
          referral_code_used:
            cleanedReferralCode || null,
          referral_bonus_points:
            bonusPoints,
          referrer_wallet_address:
            referrerWallet,
        })
        .select()
        .single()

      if (insertError) {
        throw new Error(
          `Failed to create transaction: ${insertError.message}`
        )
      }

      /*
       * Keep local transaction ID for error handling.
       */
      const transactionId = transaction.id

      createdTransactionId =
        transactionId

      setPendingTransactionId(
        transactionId
      )

      setPendingTransactionInfo({
        amount: numericAmount,
        rate: currentRate,
        bonusPoints,
        referralCode:
          cleanedReferralCode,
        referrerWallet,
        basePoints,
        walletAddress,
      })

      setCurrentStep(3)

      /*
       * Convert USDC amount to token units.
       */
      const parsedAmount = parseUnits(
        amount,
        tokenConfig.decimals
      )

      /*
       * Send USDC.
       */
      const hash =
        await writeContractAsync({
          address:
            tokenConfig.address,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [
            EVM_DESTINATION,
            parsedAmount,
          ],
        })

      submittedHash = hash

      /*
       * Save transaction hash immediately.
       */
      const {
        error: hashUpdateError,
      } = await supabase
        .from('transactions')
        .update({
          tx_hash: hash,
        })
        .eq('id', transactionId)

      if (hashUpdateError) {
        console.error(
          'Failed to save transaction hash:',
          hashUpdateError
        )
      }
    } catch (error: unknown) {
      console.error(
        'Transaction failed:',
        error
      )

      /*
       * Use the local transaction ID instead of
       * pendingTransactionId state because state may
       * not have updated yet.
       */
      if (createdTransactionId) {
        await supabase
          ?.from('transactions')
          .update({
            tx_hash:
              submittedHash ?? null,
            status: 'FAILED',
          })
          .eq(
            'id',
            createdTransactionId
          )
      }

      setIsProcessing(false)

      setPendingTransactionId(null)
      setPendingTransactionInfo(null)

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Transaction failed or was rejected.'
      )
    }
  }

  /*
   * Credit preview.
   */
  const previewBasePoints =
    amount &&
    Number.isFinite(Number(amount))
      ? Math.floor(
          Number(amount) * currentRate
        )
      : 0

  const previewBonus =
    referralCode.trim()
      ? Math.floor(
          previewBasePoints * 0.15
        )
      : 0

  const isBusy =
    isProcessing ||
    isWalletPending ||
    isConfirming

  return (
    <div
      className="card"
      style={{
        maxWidth: '600px',
        margin: '0 auto',
      }}
    >
      <div className="text-center mb-lg">
        <span
          style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius:
              'var(--radius-pill)',
            background:
              'rgba(0, 212, 170, 0.1)',
            color: 'var(--primary)',
            fontSize: '11px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px',
            border:
              '1px solid rgba(0, 212, 170, 0.2)',
          }}
        >
          Secure Token Allocation
        </span>

        <h2
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          Buy With USDC
        </h2>

        <p
          className="text-muted"
          style={{
            fontSize: '0.95rem',
          }}
        >
          Contribute via Base, Polygon,
          or BSC to lock in your allocation.
        </p>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div
          className={`step ${
            currentStep >= 1
              ? 'active'
              : ''
          }`}
        >
          <div className="step-number">
            1
          </div>
          <div className="step-label">
            Network
          </div>
        </div>

        <div
          className={`step ${
            currentStep >= 2
              ? 'active'
              : ''
          }`}
        >
          <div className="step-number">
            2
          </div>
          <div className="step-label">
            Amount
          </div>
        </div>

        <div
          className={`step ${
            currentStep >= 3
              ? 'active'
              : ''
          }`}
        >
          <div className="step-number">
            3
          </div>
          <div className="step-label">
            Confirm
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div
          style={{
            whiteSpace: 'pre-line',
            padding: '16px',
            marginBottom:
              'var(--spacing-md)',
            borderRadius:
              'var(--radius-md)',
            background:
              'rgba(0, 212, 170, 0.1)',
            border:
              '1px solid rgba(0, 212, 170, 0.3)',
            color: 'var(--primary)',
            fontWeight: 500,
            boxShadow:
              '0 4px 20px rgba(0, 212, 170, 0.1)',
          }}
        >
          {successMessage}
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div
          style={{
            whiteSpace: 'pre-line',
            padding: '16px',
            marginBottom:
              'var(--spacing-md)',
            borderRadius:
              'var(--radius-md)',
            background:
              'rgba(239, 68, 68, 0.1)',
            border:
              '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}
        >
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Confirmation State */}
      {isConfirming && (
        <div
          style={{
            padding: '16px',
            marginBottom:
              'var(--spacing-md)',
            borderRadius:
              'var(--radius-md)',
            background:
              'rgba(59, 130, 246, 0.1)',
            border:
              '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: '#60a5fa',
              fontWeight: 600,
            }}
          >
            <span
              className="status-dot"
              style={{
                background: '#60a5fa',
              }}
            />

            Waiting for blockchain
            network confirmation...
          </div>

          {transactionHash && (
            <div
              className="text-muted"
              style={{
                fontSize: '0.75rem',
                wordBreak: 'break-all',
                fontFamily: 'monospace',
                background:
                  'rgba(0,0,0,0.2)',
                padding: '6px 8px',
                borderRadius: '4px',
              }}
            >
              Tx: {transactionHash}
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSend}>
        {/* Network */}
        <div className="form-group">
          <label>
            Active Settlement Network
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(3, 1fr)',
              gap: '10px',
            }}
          >
            {[
              {
                id: 8453,
                name: 'Base',
                badge: 'Fast & Cheap',
              },
              {
                id: 137,
                name: 'Polygon',
                badge: 'Low Gas',
              },
              {
                id: 56,
                name: 'BSC',
                badge: 'BEP-20',
              },
            ].map((net) => {
              const isActive =
                chainId === net.id

              return (
                <div
                  key={net.id}
                  style={{
                    padding:
                      '12px 10px',
                    borderRadius:
                      'var(--radius-sm)',
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(0, 212, 170, 0.15), rgba(0, 255, 136, 0.05))'
                      : 'rgba(255, 255, 255, 0.03)',
                    border: isActive
                      ? '1px solid var(--primary)'
                      : '1px solid var(--card-border)',
                    textAlign: 'center',
                    transition:
                      'all 0.2s ease',
                    boxShadow: isActive
                      ? 'var(--glow-primary)'
                      : 'none',
                  }}
                >
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: isActive
                        ? 'var(--primary)'
                        : 'var(--text-primary)',
                    }}
                  >
                    {net.name}
                  </div>

                  <div
                    style={{
                      fontSize: '9px',
                      color:
                        'var(--text-muted)',
                      marginTop: '3px',
                      textTransform:
                        'uppercase',
                    }}
                  >
                    {net.badge}
                  </div>
                </div>
              )
            })}
          </div>

          {!tokenConfig &&
            isConnected && (
              <div
                style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  background:
                    'rgba(245, 158, 11, 0.1)',
                  border:
                    '1px solid rgba(245, 158, 11, 0.25)',
                  color: '#f59e0b',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  fontWeight: 600,
                }}
              >
                ⚠️ Please switch your
                wallet network to Base,
                Polygon, or BSC to
                continue.
              </div>
            )}
        </div>

        {/* Amount */}
        <div className="form-group">
          <label>
            Contribution Amount (USDC)
          </label>

          <div
            style={{
              position: 'relative',
            }}
          >
            <input
              type="number"
              step="0.01"
              min={MIN_USDC_AMOUNT}
              placeholder={`Min ${MIN_USDC_AMOUNT} USDC`}
              value={amount}
              disabled={isBusy}
              onChange={(e) => {
                const val =
                  e.target.value

                setAmount(val)
                setCurrentStep(
                  val ? 2 : 1
                )
                setErrorMessage('')
                setSuccessMessage('')
              }}
              required
              style={{
                fontSize: '1.35rem',
                padding: '16px',
                fontWeight: 700,
                letterSpacing:
                  '-0.01em',
              }}
            />

            <div
              style={{
                position: 'absolute',
                right: '16px',
                top: '50%',
                transform:
                  'translateY(-50%)',
                color:
                  'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.9rem',
                pointerEvents: 'none',
              }}
            >
              USDC
            </div>
          </div>
        </div>

        {/* Referral Code */}
        <div className="form-group">
          <label>
            Referral Code (Optional)
          </label>

          <input
            type="text"
            placeholder="e.g. APEX2026"
            value={referralCode}
            disabled={isBusy}
            onChange={(e) =>
              setReferralCode(
                e.target.value.toUpperCase()
              )
            }
            style={{
              fontSize: '0.95rem',
              textTransform:
                'uppercase',
              letterSpacing: '1px',
              fontWeight: 600,
            }}
          />
        </div>

        {/* Credit Preview */}
        {amount &&
          Number(amount) >=
            MIN_USDC_AMOUNT && (
            <div
              style={{
                background:
                  'linear-gradient(145deg, rgba(17, 17, 17, 0.9), rgba(28, 28, 28, 0.9))',
                border:
                  '1px solid rgba(0, 212, 170, 0.25)',
                borderRadius:
                  'var(--radius-md)',
                padding: '18px',
                marginTop: '4px',
                boxShadow:
                  'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span
                  className="text-muted"
                  style={{
                    fontSize:
                      '0.85rem',
                  }}
                >
                  Live Exchange Rate
                </span>

                <span
                  style={{
                    fontSize:
                      '0.85rem',
                    fontWeight: 600,
                  }}
                >
                  1 USDC ={' '}
                  {currentRate.toLocaleString()}{' '}
                  Credits
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                  marginBottom: '8px',
                }}
              >
                <span
                  className="text-muted"
                  style={{
                    fontSize:
                      '0.85rem',
                  }}
                >
                  Base Allocation Earned
                </span>

                <span
                  style={{
                    fontSize:
                      '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  {previewBasePoints.toLocaleString()}{' '}
                  Credits
                </span>
              </div>

              {referralCode.trim() && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent:
                      'space-between',
                    alignItems:
                      'center',
                    marginBottom:
                      '8px',
                    color:
                      'var(--primary)',
                  }}
                >
                  <span
                    style={{
                      fontSize:
                        '0.85rem',
                    }}
                  >
                    Referral Bonus
                    (+10%)
                  </span>

                  <span
                    style={{
                      fontSize:
                        '0.9rem',
                      fontWeight: 700,
                    }}
                  >
                    +
                    {previewBonus.toLocaleString()}{' '}
                    Credits
                  </span>
                </div>
              )}

              <div
                style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop:
                    '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    fontSize:
                      '0.95rem',
                  }}
                >
                  Estimated Total
                  Credits
                </span>

                <span
                  style={{
                    fontWeight: 800,
                    fontSize:
                      '1.2rem',
                    color:
                      'var(--primary)',
                    textShadow:
                      '0 0 20px rgba(0,212,170,0.3)',
                  }}
                >
                  {(
                    previewBasePoints +
                    previewBonus
                  ).toLocaleString()}
                </span>
              </div>
            </div>
          )}

        {/* Connect Wallet */}
        {!isConnected && (
          <div className="text-center mt-md">
            <ConnectButton />
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={
            isBusy ||
            !isConnected ||
            !tokenConfig
          }
          className="primary mt-sm"
          style={{
            width: '100%',
            fontSize: '1.15rem',
            padding: '18px 24px',
            fontWeight: 800,
            borderRadius:
              'var(--radius-md)',
            letterSpacing:
              '0.01em',
            boxShadow:
              '0 8px 30px rgba(0, 212, 170, 0.3)',
          }}
        >
          {!isConnected
            ? 'Connect Wallet to Participate'
            : !tokenConfig
            ? 'Switch Network Required'
            : isWalletPending
            ? 'Confirm in Wallet...'
            : isConfirming
            ? 'Confirming Transaction...'
            : isProcessing
            ? 'Processing Allocation...'
            : 'Contribute & Continue 🚀'}
        </button>

        {/* Transaction Hash */}
        {transactionHash &&
          !isConfirmed && (
            <div
              className="text-muted text-center"
              style={{
                marginTop: '12px',
                fontSize: '0.75rem',
                wordBreak:
                  'break-all',
                fontFamily:
                  'monospace',
              }}
            >
              Transaction Hash:{' '}
              {transactionHash}
            </div>
          )}
      </form>
    </div>
  )
}
