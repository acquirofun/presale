'use client'

import { useDisconnect, useAppKit, useAppKitNetwork } from '@reown/appkit/react'
import { base, polygon, bsc } from '@reown/appkit/networks'
import Image from 'next/image'

export const ActionButtonList = () => {
  const { disconnect } = useDisconnect()
  const { open } = useAppKit()
  const { switchNetwork } = useAppKitNetwork()

  const handleDisconnect = async () => {
    try {
      await disconnect()
    } catch (error) {
      console.error('Failed to disconnect:', error)
    }
  }

  return (
    <section className="wallet-panel">

      {/* Header */}
      <div className="wallet-panel-header">
        <div className="wallet-title-row">
          <div className="wallet-icon">
            <span>◈</span>
          </div>

          <div>
            <h3>Wallet</h3>
            <p>Manage your connection & network</p>
          </div>
        </div>

        <div className="wallet-status">
          <span className="status-dot" />
          Connected
        </div>
      </div>

      {/* Main Wallet Action */}
      <button
        onClick={() => open()}
        className="wallet-main-button"
      >
        <div className="wallet-main-icon">
          ⇄
        </div>

        <div className="wallet-main-content">
          <strong>Open Wallet</strong>
          <span>Buy, swap & manage your assets</span>
        </div>

        <div className="wallet-arrow">
          →
        </div>
      </button>

      {/* Network Section */}
      <div className="network-section">

        <div className="section-label">
          <span>Select Network</span>
          <span className="network-hint">
            For token purchase
          </span>
        </div>

        <div className="network-grid">

          {/* Base */}
          <button
            onClick={() => switchNetwork(base)}
            className="network-button"
          >
            <div className="network-logo">
              <Image
                src="/bass.jpeg"
                alt="Base"
                width={42}
                height={42}
              />
            </div>

            <div className="network-info">
              <strong>Base</strong>
              <span>USDC / USDT</span>
            </div>

            <span className="network-chevron">
              ›
            </span>
          </button>

          {/* Polygon */}
          <button
            onClick={() => switchNetwork(polygon)}
            className="network-button"
          >
            <div className="network-logo">
              <Image
                src="/pol.png"
                alt="Polygon"
                width={42}
                height={42}
              />
            </div>

            <div className="network-info">
              <strong>Polygon</strong>
              <span>USDC / USDT</span>
            </div>

            <span className="network-chevron">
              ›
            </span>
          </button>

          {/* BNB Chain */}
          <button
            onClick={() => switchNetwork(bsc)}
            className="network-button"
          >
            <div className="network-logo">
              <Image
                src="/bnb.png"
                alt="BNB Chain"
                width={42}
                height={42}
              />
            </div>

            <div className="network-info">
              <strong>BNB Chain</strong>
              <span>USDC / USDT</span>
            </div>

            <span className="network-chevron">
              ›
            </span>
          </button>

          {/* Solana */}
          <button
            disabled
            className="network-button network-disabled"
            onClick={() =>
              alert(
                'Solana transactions are temporarily disabled for security improvements. Please use Base, Polygon, or BNB Chain.'
              )
            }
          >
            <div className="network-logo">
              <Image
                src="/Sola.png"
                alt="Solana"
                width={42}
                height={42}
              />
            </div>

            <div className="network-info">
              <strong>Solana</strong>
              <span>Temporarily unavailable</span>
            </div>

            <span className="coming-soon">
              Soon
            </span>
          </button>

        </div>
      </div>

      {/* Disconnect */}
      <button
        onClick={handleDisconnect}
        className="disconnect-button"
      >
        <span>↪</span>
        Disconnect Wallet
      </button>

      {/* Security Notice */}
      <div className="wallet-security">
        <span className="security-icon">
          ✓
        </span>

        <div>
          <strong>Secure connection</strong>

          <p>
            Your wallet stays in your control.
            We never store your private keys.
          </p>
        </div>
      </div>

    </section>
  )
}
