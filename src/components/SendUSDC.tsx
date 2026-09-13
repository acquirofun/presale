// src/components/SendUSDC.tsx
'use client'

import { useState, useEffect } from 'react'
import { useWriteContract, useAccount } from 'wagmi'
import { parseUnits } from 'viem'
import { useAppKitAccount } from '@reown/appkit/react'
import { createClient } from '@supabase/supabase-js'
import { calculateCurrentRate } from '@/utils/rateCalculator'
import { ConnectButton } from '@/components/ConnectButton'

const supabase = createClient(
  process.env.SUPABASE_URL || "https://kifydthslaqeqmohvetb.supabase.co", 
  process.env.SUPABASE_KEY || "sb_publishable_gPldRZjoctXxbEuEmy1GjA_EjzSLjqk"
)

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

const USDC_CONTRACTS: Record<number, { address: `0x${string}`; decimals: number; name: string }> = {
  8453: { name: 'Base', address: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', decimals: 6 },
  137: { name: 'Polygon', address: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359', decimals: 6 },
  56: { name: 'BSC', address: '0x8AC76a51cc950d9822d68b83fe1ad97b32cd580d', decimals: 18 },
}

const EVM_DESTINATION = '0x3B641788F43ECDEdA6177AD26aE53fBb5D9566E6'
const SOLANA_DESTINATION = 'Cs56FWXW2Wa9yZg8B6kDHjHixLbLNrYmGZ2YRN6HVPBa'

// Helper function to update credits in Supabase
async function awardCredits(walletAddress: string, usdcAmount: number, rate: number, bonusPoints: number = 0) {
  const creditsEarned = Math.floor(usdcAmount * rate) + bonusPoints
  const cleanAddress = walletAddress.toLowerCase()

  // Fetch current credits
  const { data: existingUser } = await supabase
    .from('user_credits')
    .select('credits')
    .eq('wallet_address', cleanAddress)
    .single()

  const currentCredits = existingUser ? existingUser.credits : 0
  const newTotalCredits = currentCredits + creditsEarned

  // Upsert updated total credits
  await supabase
    .from('user_credits')
    .upsert({
      wallet_address: cleanAddress,
      credits: newTotalCredits,
      updated_at: new Date()
    }, { onConflict: 'wallet_address' })

  return creditsEarned
}

export function SendUSDC() {
  const { address, chainId, isConnected } = useAccount()
  const { caipAddress } = useAppKitAccount()
  const { writeContractAsync, isPending } = useWriteContract()

  const [amount, setAmount] = useState('')
  const [currentRate, setCurrentRate] = useState(calculateCurrentRate().currentRate)
  const [referralCode, setReferralCode] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  const isSolana = caipAddress?.startsWith('solana')

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRate(calculateCurrentRate().currentRate)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isConnected || !address) {
      alert('Please connect your wallet first.')
      return
    }

    const numericAmount = Number(amount)
    if (!amount || numericAmount <= 0) {
      alert('Please enter a valid amount.')
      return
    }

    // Validate referral code if provided
    let referralValidation: { is_valid: boolean; referrer_wallet: string; error_message: string } | null = null
    let referrerWallet: string | null = null

    if (referralCode.trim()) {
      try {
        const { data: validation, error } = await supabase
          .rpc('validate_referral_code', {
            code: referralCode.trim(),
            user_wallet: address
          })

        if (error) throw error

        referralValidation = validation?.[0]

        if (!referralValidation?.is_valid) {
          alert(referralValidation?.error_message || 'Invalid referral code')
          return
        }

        referrerWallet = referralValidation.referrer_wallet
      } catch (error) {
        console.error('Referral validation failed:', error)
        alert('Failed to validate referral code. Please try again.')
        return
      }
    }

    try {
      if (isSolana) {
        // DISABLED: Solana transactions require proper implementation to prevent security exploit
        // The current implementation allows users to get free credits without actual transactions
        alert('Solana transactions are temporarily disabled for security improvements. Please use Base, Polygon, or BSC networks for secure transactions.')
        return
      } else {
        const tokenConfig = USDC_CONTRACTS[chainId || 8453]
        if (!tokenConfig) {
          alert('Please switch to Base, Polygon, or BSC.')
          return
        }

        const parsedAmount = parseUnits(amount, tokenConfig.decimals)

        // Calculate base points and bonus
        const basePoints = Math.floor(numericAmount * currentRate)
        const bonusPoints = referrerWallet ? Math.floor(basePoints * 0.10) : 0 // 10% bonus for referred user

        // 1. Log as PENDING initially
        const { data: insertData } = await supabase.from('transactions').insert({
          sender_address: address.toLowerCase(),
          recipient_address: EVM_DESTINATION.toLowerCase(),
          amount: numericAmount,
          chain: tokenConfig.name,
          status: 'PENDING',
          referral_code_used: referralCode.trim() || null,
          referral_bonus_points: bonusPoints,
          referrer_wallet_address: referrerWallet || null
        }).select().single()

        // 2. Execute smart contract call
        const hash = await writeContractAsync({
          address: tokenConfig.address,
          abi: ERC20_ABI,
          functionName: 'transfer',
          args: [EVM_DESTINATION, parsedAmount],
        })

        // 3. Update transaction to SUCCESS with hash
        if (insertData) {
          await supabase.from('transactions').update({
            tx_hash: hash,
            status: 'SUCCESS'
          }).eq('id', insertData.id)
        }

        // 4. Award Credits to referred user
        const earned = await awardCredits(address, numericAmount, currentRate, bonusPoints)

        // 5. If referral code was used, create referral relationship and award referrer
        if (referrerWallet && insertData) {
          // Create referral relationship
          await supabase.from('referral_relationships').insert({
            referral_code: referralCode.trim(),
            referred_wallet_address: address.toLowerCase(),
            referrer_wallet_address: referrerWallet,
            total_referred_amount: numericAmount
          })

          // Calculate referrer's 20% bonus
          const referrerBonus = Math.floor(basePoints * 0.20)

          // Award points to referrer
          await awardCredits(referrerWallet, 0, 0, referrerBonus)

          // Record referrer earnings
          await supabase.from('referral_earnings').insert({
            referrer_wallet_address: referrerWallet,
            referred_wallet_address: address.toLowerCase(),
            transaction_id: insertData.id,
            earned_amount: numericAmount,
            earned_points: referrerBonus
          })
        }

        // 6. Show success message
        let message = `Transaction sent successfully! Hash: ${hash}\nYou earned ${earned.toLocaleString()} credits!`
        if (bonusPoints > 0) {
          message += `\n+${bonusPoints.toLocaleString()} bonus points from referral!`
        }
        alert(message)
        setAmount('')
        setReferralCode('')
      }
    } catch (error: unknown) {
      console.error('Transfer failed:', error)

      // Log failure in Supabase
      await supabase.from('transactions').insert({
        sender_address: address.toLowerCase(),
        recipient_address: isSolana ? SOLANA_DESTINATION : EVM_DESTINATION.toLowerCase(),
        amount: numericAmount,
        chain: isSolana ? 'Solana' : 'EVM',
        status: 'FAILED',
      })
      alert('Transaction failed or was rejected.')
    }
  }

  return (
    <div className="card" style={{ maxWidth: '600px' }}>
      <h2 className="text-center" style={{ fontSize: '1.75rem', marginBottom: 'var(--spacing-lg)' }}>
        Buy With USDC
      </h2>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Pay with crypto</div>
        </div>
        <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">Enter amount</div>
        </div>
        <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Review & Buy</div>
        </div>
      </div>

      <form onSubmit={handleSend}>
        {/* Step 1: Crypto Selection */}
        <div className="form-group">
          <label>Select Network</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 'var(--spacing-sm)' }}>
            <button 
              type="button"
              className={chainId === 8453 ? 'primary' : ''}
              onClick={() => {/* Network switching handled by ActionButtonList */}}
            >
              Base
            </button>
            <button 
              type="button"
              className={chainId === 137 ? 'primary' : ''}
              onClick={() => {/* Network switching handled by ActionButtonList */}}
            >
              Polygon
            </button>
            <button 
              type="button"
              className={chainId === 56 ? 'primary' : ''}
              onClick={() => {/* Network switching handled by ActionButtonList */}}
            >
              BSC
            </button>
          </div>
        </div>

        {/* Step 2: Amount Input */}
        <div className="form-group">
          <label>Enter the amount of USDC to send</label>
          <input 
            type="number" 
            step="any"
            min="5"
            placeholder="Min $5 USDC" 
            value={amount} 
            onChange={(e) => {
              setAmount(e.target.value)
              if (e.target.value) setCurrentStep(2)
            }}
            required
            style={{ fontSize: '1.25rem', padding: '16px' }}
          />
        </div>

        {/* Referral Code */}
        <div className="form-group">
          <label>Do you have a discount code or referral code?</label>
          <input 
            type="text" 
            placeholder="Enter code (optional)" 
            value={referralCode} 
            onChange={(e) => setReferralCode(e.target.value)}
            style={{ fontSize: '0.875rem' }}
          />
        </div>

        {/* Credit Calculation */}
        {amount && (
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            borderRadius: 'var(--radius-sm)',
            padding: 'var(--spacing-md)',
            marginBottom: 'var(--spacing-md)'
          }}>
            <div className="text-success" style={{ fontSize: '1rem', fontWeight: '600' }}>
              You will earn {Math.floor(Number(amount) * currentRate).toLocaleString()} credits
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem', marginTop: '4px' }}>
              at current rate: 1 USDC = {currentRate.toLocaleString()} points
            </div>
            {referralCode && (
              <div className="text-success" style={{ fontSize: '0.875rem', marginTop: '4px' }}>
                +{Math.floor(Number(amount) * currentRate * 0.10).toLocaleString()} bonus points from referral!
              </div>
            )}
          </div>
        )}

        {/* Connect Wallet Button (shown when not connected) */}
        {!isConnected && (
          <div className="text-center mb-md">
            <ConnectButton />
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={isPending || !isConnected}
          className="primary"
          style={{ 
            fontSize: '1.125rem', 
            padding: '16px 24px',
            fontWeight: '700'
          }}
        >
          {!isConnected ? 'Connect Wallet First' : isPending ? 'Confirming in Wallet...' : 'Buy Now'}
        </button>
      </form>
    </div>
  )
}