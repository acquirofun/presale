
'use client'

import { useEffect, useState } from 'react'
import {
  useAppKitAccount,
  useAppKitProvider,
} from '@reown/appkit/react'

import { calculateCurrentRate } from '@/utils/rateCalculator'
import { ConnectButton } from '@/components/ConnectButton'

const MIN_USDT_AMOUNT = 5

/*
 * Official USDT Jetton master on TON mainnet.
 */
const TON_USDT_MASTER =
  process.env.NEXT_PUBLIC_TON_USDT_MASTER ||
  'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'

/*
 * Your PointSwap receiving wallet.
 */
const TON_PAYMENT_WALLET =
  process.env.NEXT_PUBLIC_TON_PAYMENT_WALLET ||
  'UQBulg-JME0aSAoMNQMwNiM0bVHPrphH_df8g2iiNPEbT-6Y'

/*
 * TON mainnet network ID.
 */
const TON_NETWORK = '-239'

const TON_USDT_DECIMALS = 6

/*
 * Reown's provider typing can vary depending on the installed
 * AppKit version. We intentionally keep this type minimal.
 *
 * The important method is sendTransaction().
 */
type TonWalletProvider = {
  sendTransaction?: (request: {
    validUntil: number
    network?: string
    from?: string
    items?: Array<{
      type: 'jetton'
      master: string
      destination: string
      amount: string
      attachAmount?: string
      responseDestination?: string
      forwardAmount?: string
      forwardPayload?: string
      queryId?: string
    }>
    messages?: Array<{
      address: string
      amount: string
      payload?: string
      stateInit?: string
      extraCurrency?: Record<number, string>
    }>
  }) => Promise<{
    boc: string
    traceId?: string
  }>
}

function parseUSDTAmount(value: string): bigint {
  const normalized = value.trim()

  if (!/^\d+(\.\d{1,6})?$/.test(normalized)) {
    throw new Error(
      'Invalid USDT amount. Maximum 6 decimal places are supported.'
    )
  }

  const [whole, fraction = ''] = normalized.split('.')

  const paddedFraction = fraction.padEnd(
    TON_USDT_DECIMALS,
    '0'
  )

  return (
    BigInt(whole) *
      BigInt(10) ** BigInt(TON_USDT_DECIMALS) +
    BigInt(paddedFraction)
  )
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (
    typeof error === 'object' &&
    error !== null
  ) {
    const value = error as Record<string, unknown>

    if (typeof value.message === 'string') {
      return value.message
    }

    if (typeof value.error === 'string') {
      return value.error
    }
  }

  return 'TON payment was cancelled or failed.'
}

export function SendTONUSDT() {
  const {
    address,
    isConnected,
  } = useAppKitAccount()

  const {
    walletProvider,
  } =
    useAppKitProvider<TonWalletProvider>('ton')

  const [amount, setAmount] = useState('')

  const [currentRate, setCurrentRate] =
    useState(
      calculateCurrentRate().currentRate
    )

  const [referralCode, setReferralCode] =
    useState('')

  const [currentStep, setCurrentStep] =
    useState(1)

  const [isProcessing, setIsProcessing] =
    useState(false)

  const [successMessage, setSuccessMessage] =
    useState('')

  const [errorMessage, setErrorMessage] =
    useState('')

  /*
   * Live rate update.
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
   * Preview calculation.
   */
  const numericAmount = Number(amount)

  const previewBasePoints =
    amount &&
    Number.isFinite(numericAmount)
      ? Math.floor(
          numericAmount * currentRate
        )
      : 0

  const previewBonus =
    referralCode.trim()
      ? Math.floor(
          previewBasePoints * 0.15
        )
      : 0

  const totalPreview =
    previewBasePoints + previewBonus

  /*
   * Send TON USDT Jetton payment.
   */
  const handleSend = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')

    /*
     * Wallet validation.
     */
    if (!isConnected || !address) {
      setErrorMessage(
        'Please connect your TON wallet first.'
      )
      return
    }

    if (!walletProvider) {
      setErrorMessage(
        'TON wallet provider is not available. Please reconnect your wallet.'
      )
      return
    }

    /*
     * Amount validation.
     */
    if (
      !amount ||
      !Number.isFinite(numericAmount) ||
      numericAmount < MIN_USDT_AMOUNT
    ) {
      setErrorMessage(
        `Minimum purchase is ${MIN_USDT_AMOUNT} USDT.`
      )
      return
    }

    let amountBaseUnits: bigint

    try {
      amountBaseUnits =
        parseUSDTAmount(amount)
    } catch {
      setErrorMessage(
        'Please enter a valid USDT amount with up to 6 decimal places.'
      )
      return
    }

    /*
     * Make sure the wallet provider actually
     * supports TON Connect sendTransaction.
     */
    if (
      typeof walletProvider.sendTransaction !==
      'function'
    ) {
      setErrorMessage(
        'Your connected TON wallet does not expose the TON Connect sendTransaction API. Please reconnect using a TON Connect compatible wallet.'
      )
      return
    }

    setIsProcessing(true)
    setCurrentStep(3)

    try {
      /*
       * -------------------------------------------------------
       * TON CONNECT JETTON TRANSFER
       * -------------------------------------------------------
       *
       * USDT on TON is a Jetton.
       *
       * We therefore DO NOT send:
       *
       *   TON_PAYMENT_WALLET
       *
       * with the USDT amount directly.
       *
       * Instead we ask the TON wallet to perform a
       * TEP-74 Jetton transfer using the official USDT
       * Jetton master.
       *
       * The wallet resolves the user's USDT Jetton wallet
       * and creates the appropriate transfer payload.
       */

      const transaction = {
        validUntil:
          Math.floor(Date.now() / 1000) +
          600,

        network: TON_NETWORK,

        /*
         * Restrict transaction to the connected
         * account.
         */
        from: address,

        items: [
          {
            type: 'jetton' as const,

            /*
             * USDT Jetton master.
             */
            master: TON_USDT_MASTER,

            /*
             * Your regular TON receiving wallet.
             *
             * The wallet handles the Jetton-wallet
             * resolution.
             */
            destination:
              TON_PAYMENT_WALLET,

            /*
             * USDT amount in smallest units.
             *
             * Example:
             *
             * 5 USDT
             *
             * becomes:
             *
             * 5000000
             */
            amount:
              amountBaseUnits.toString(),

            /*
             * Amount of TON attached for Jetton
             * execution/gas.
             *
             * 0.05 TON is a conservative value for
             * this type of transaction.
             *
             * Excess is returned according to the
             * Jetton transfer flow.
             */
            attachAmount:
              '50000000',

            /*
             * Return excess TON to the connected
             * wallet.
             */
            responseDestination:
              address,

            /*
             * Small forward amount so the destination
             * Jetton wallet can process the transfer.
             */
            forwardAmount: '1',

            /*
             * No extra forward payload.
             */
            forwardPayload: '',

            /*
             * Unique-ish query ID for this payment.
             */
            queryId:
              Date.now().toString(),
          },
        ],
      }

      console.log(
        '[TON] Sending USDT Jetton transaction:',
        {
          sender: address,
          destination:
            TON_PAYMENT_WALLET,
          amount,
          amountBaseUnits:
            amountBaseUnits.toString(),
          master: TON_USDT_MASTER,
        }
      )

      /*
       * Open Trust Wallet / compatible TON wallet
       * for confirmation.
       */
      const result =
        await walletProvider.sendTransaction(
          transaction
        )

      console.log(
        '[TON] Wallet transaction result:',
        result
      )

      /*
       * TON Connect returns a BoC.
       */
      const boc = result?.boc

      if (!boc) {
        throw new Error(
          'The TON wallet did not return a transaction BoC.'
        )
      }

      /*
       * -------------------------------------------------------
       * BACKEND VERIFICATION
       * -------------------------------------------------------
       *
       * IMPORTANT:
       *
       * Do NOT award credits merely because the wallet
       * returned a successful sendTransaction response.
       *
       * Your API must verify the actual blockchain
       * transaction.
       */
      const verificationResponse =
        await fetch(
          '/api/ton/verify',
          {
            method: 'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify({
              walletAddress:
                address,

              amount,

              amountBaseUnits:
                amountBaseUnits.toString(),

              referralCode:
                referralCode
                  .trim()
                  .toUpperCase() ||
                null,

              boc,

              jettonMaster:
                TON_USDT_MASTER,

              paymentWallet:
                TON_PAYMENT_WALLET,
            }),
          }
        )

      let verification: {
        success?: boolean
        message?: string
        creditsAwarded?: number
      } = {}

      try {
        verification =
          await verificationResponse.json()
      } catch {
        verification = {}
      }

      if (
        !verificationResponse.ok ||
        !verification.success
      ) {
        throw new Error(
          verification.message ||
            'Transaction was submitted, but blockchain verification is still pending.'
        )
      }

      /*
       * SUCCESS
       */
      setSuccessMessage(
        `Payment verified successfully.\n\n` +
          `Amount: ${numericAmount.toLocaleString()} USDT\n` +
          `Credits: ${
            verification.creditsAwarded?.toLocaleString?.() ??
            totalPreview.toLocaleString()
          }\n\n` +
          `Your transaction has been confirmed on TON.`
      )

      setAmount('')
      setReferralCode('')
      setCurrentStep(3)
    } catch (error) {
      console.error(
        'TON USDT payment error:',
        error
      )

      const message =
        getErrorMessage(error)

      const lowerMessage =
        message.toLowerCase()

      /*
       * User rejected transaction.
       */
      if (
        lowerMessage.includes(
          'reject'
        ) ||
        lowerMessage.includes(
          'cancel'
        ) ||
        lowerMessage.includes(
          'user rejected'
        ) ||
        lowerMessage.includes(
          'user_rejects'
        ) ||
        lowerMessage.includes(
          '300'
        )
      ) {
        setErrorMessage(
          'Transaction cancelled in your TON wallet.'
        )
      } else if (
        lowerMessage.includes(
          'not support'
        ) ||
        lowerMessage.includes(
          'method_not_supported'
        )
      ) {
        setErrorMessage(
          'This TON wallet does not support Jetton transfers through the current connection. Please reconnect your TON wallet.'
        )
      } else if (
        lowerMessage.includes(
          'insufficient'
        ) ||
        lowerMessage.includes(
          'balance'
        )
      ) {
        setErrorMessage(
          'Insufficient balance. Make sure you have enough TON for network fees and enough USDT on TON for the purchase.'
        )
      } else {
        setErrorMessage(message)
      }

      setCurrentStep(2)
    } finally {
      setIsProcessing(false)
    }
  }

  const isBusy = isProcessing

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
          TON Network
        </span>

        <h2
          style={{
            fontSize: '1.85rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}
        >
          Buy With USDT
        </h2>

        <p
          className="text-muted"
          style={{
            fontSize: '0.95rem',
          }}
        >
          Contribute with USDT on the
          TON network through a
          compatible TON wallet.
        </p>
      </div>

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
          }}
        >
          {successMessage}
        </div>
      )}

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

      <form onSubmit={handleSend}>
        <div className="form-group">
          <label>
            Active Settlement Network
          </label>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                '1fr',
              gap: '10px',
            }}
          >
            <div
              style={{
                padding:
                  '14px 12px',
                borderRadius:
                  'var(--radius-sm)',
                background:
                  'linear-gradient(135deg, rgba(0, 212, 170, 0.15), rgba(0, 255, 136, 0.05))',
                border:
                  '1px solid var(--primary)',
                textAlign: 'center',
                boxShadow:
                  'var(--glow-primary)',
              }}
            >
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color:
                    'var(--primary)',
                }}
              >
                TON
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
                TON Mainnet
              </div>
            </div>
          </div>

          {isConnected && (
            <div
              style={{
                marginTop: '8px',
                padding:
                  '8px 12px',
                borderRadius: '6px',
                background:
                  'rgba(0, 212, 170, 0.08)',
                border:
                  '1px solid rgba(0, 212, 170, 0.2)',
                color:
                  'var(--primary)',
                fontSize: '0.78rem',
                textAlign: 'center',
                fontWeight: 600,
              }}
            >
              ✓ TON wallet connected
            </div>
          )}
        </div>

        {isConnected &&
          address && (
            <div className="form-group">
              <label>
                Connected TON Wallet
              </label>

              <div
                style={{
                  padding:
                    '12px 14px',
                  borderRadius:
                    'var(--radius-sm)',
                  background:
                    'rgba(255, 255, 255, 0.03)',
                  border:
                    '1px solid var(--card-border)',
                  fontFamily:
                    'monospace',
                  fontSize:
                    '0.75rem',
                  wordBreak:
                    'break-all',
                  color:
                    'var(--text-muted)',
                }}
              >
                {address}
              </div>
            </div>
          )}

        <div className="form-group">
          <label>
            Contribution Amount (USDT)
          </label>

          <div
            style={{
              position: 'relative',
            }}
          >
            <input
              type="number"
              step="0.000001"
              min={MIN_USDT_AMOUNT}
              placeholder={`Min ${MIN_USDT_AMOUNT} USDT`}
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
                position:
                  'absolute',
                right: '16px',
                top: '50%',
                transform:
                  'translateY(-50%)',
                color:
                  'var(--text-muted)',
                fontWeight: 700,
                fontSize:
                  '0.9rem',
                pointerEvents:
                  'none',
              }}
            >
              USDT
            </div>
          </div>
        </div>

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
              letterSpacing:
                '1px',
              fontWeight: 600,
            }}
          />
        </div>

        {amount &&
          Number(amount) >=
            MIN_USDT_AMOUNT && (
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
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                  marginBottom:
                    '8px',
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
                  1 USDT ={' '}
                  {currentRate.toLocaleString()}{' '}
                  Credits
                </span>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                  marginBottom:
                    '8px',
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
                    (+15%)
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
                  alignItems:
                    'center',
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
                  }}
                >
                  {totalPreview.toLocaleString()}
                </span>
              </div>
            </div>
          )}

        {!isConnected && (
          <div className="text-center mt-md">
            <ConnectButton />
          </div>
        )}

        <button
          type="submit"
          disabled={
            isBusy ||
            !isConnected
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
            ? 'Connect TON Wallet to Participate'
            : isProcessing
            ? 'Confirming in TON Wallet...'
            : 'Contribute with TON USDT 🚀'}
        </button>

        <div
          className="text-muted text-center"
          style={{
            marginTop: '12px',
            fontSize:
              '0.72rem',
            lineHeight: 1.5,
          }}
        >
          Payments are processed on
          the TON network. Your
          transaction will be verified
          before credits are awarded.
        </div>
      </form>
    </div>
  )
}

