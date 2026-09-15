'use client'

import { useEffect, useState } from 'react'
import { useAppKitAccount } from '@reown/appkit/react'

import { calculateCurrentRate } from '@/utils/rateCalculator'
import { ConnectButton } from '@/components/ConnectButton'

const MIN_USDT_AMOUNT = 5

const TON_USDT_MASTER =
  process.env.NEXT_PUBLIC_TON_USDT_MASTER ||
  'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'

const TON_PAYMENT_WALLET =
  process.env.NEXT_PUBLIC_TON_PAYMENT_WALLET ||
  'UQBulg-JME0aSAoMNQMwNiM0bVHPrphH_df8g2iiNPEbT-6Y'

const TON_USDT_DECIMALS = 6

export function SendTONUSDT() {
  const { address, isConnected } =
    useAppKitAccount()

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
   * Update the current rate every second.
   */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRate(
        calculateCurrentRate().currentRate
      )
    }, 1000)

    return () =>
      clearInterval(interval)
  }, [])

  /*
   * Preview credits.
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
   * Temporary payment handler.
   *
   * IMPORTANT:
   * This does not send USDT yet.
   * We will replace this with the real
   * TON Jetton transaction after the UI
   * has been verified.
   */
  const handleSend = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')

    if (!isConnected || !address) {
      setErrorMessage(
        'Please connect your TON wallet first.'
      )
      return
    }

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

    setIsProcessing(true)
    setCurrentStep(3)

    /*
     * Temporary delay so the UI can be tested.
     */
    await new Promise((resolve) =>
      setTimeout(resolve, 700)
    )

    console.log({
      walletAddress: address,
      amount: numericAmount,
      usdtMaster: TON_USDT_MASTER,
      paymentWallet: TON_PAYMENT_WALLET,
      decimals: TON_USDT_DECIMALS,
      referralCode:
        referralCode.trim().toUpperCase(),
    })

    setSuccessMessage(
      'TON payment interface is ready. The secure USDT transaction will be enabled next.'
    )

    setIsProcessing(false)
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
      {/* Header */}
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
          TON network through Tonkeeper.
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

      {/* Success */}
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

      {/* Error */}
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
        {/* Network */}
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
                Tonkeeper • Mainnet
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

        {/* Wallet */}
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

        {/* Amount */}
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
              step="0.01"
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
                position: 'absolute',
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

        {/* Referral */}
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

        {/* Preview */}
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
                boxShadow:
                  'inset 0 1px 0 rgba(255, 255, 255, 0.05)',
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
                    textShadow:
                      '0 0 20px rgba(0,212,170,0.3)',
                  }}
                >
                  {totalPreview.toLocaleString()}
                </span>
              </div>
            </div>
          )}

        {/* Connect */}
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
            ? 'Preparing TON Payment...'
            : 'Contribute with TON USDT 🚀'}
        </button>

        {/* Security note */}
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