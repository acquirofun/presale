
'use client'

import { useEffect, useState } from 'react'
import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { createClient } from '@supabase/supabase-js'
import Image from 'next/image'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null

export function Header() {
  const { isConnected, address } = useAppKitAccount()
  const { open } = useAppKit()

  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchCredits() {
      if (!isConnected || !address || !supabase) {
        setCredits(0)
        return
      }

      setLoading(true)

      try {
        const { data, error } = await supabase
          .from('user_credits')
          .select('credits')
          .eq('wallet_address', address.toLowerCase())
          .maybeSingle()

        if (cancelled) return

        if (error) {
          console.error('Failed to fetch credits:', error)
          setCredits(0)
          return
        }

        setCredits(data?.credits ?? 0)
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to fetch credits:', error)
          setCredits(0)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    fetchCredits()

    return () => {
      cancelled = true
    }
  }, [isConnected, address])

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : ''

  return (
    <header className="site-header">
      <div className="header-inner">

        {/* Logo */}
        <a href="/home" className="brand">
          <div className="brand-logo">
            <Image
              src="/favicon.jpeg"
              alt="PointSwap"
              width={42}
              height={42}
              priority
            />
          </div>

          <div className="brand-text">
            <span className="brand-name">PointSwap</span>
            <span className="brand-tagline">Web3 Presale</span>
          </div>
        </a>

        {/* Desktop Navigation */}
         <nav className="desktop-nav">
            <a href="/home" className="nav-link">
              <span>Home</span>
            </a>

            <a href="/dashboard" className="nav-link">
              <span>Dashboard</span>
            </a>

            <a href="/referral" className="nav-link">
              <span>Referral</span>
            </a>

            <a href="/tokenomics" className="nav-link">
              <span>Tokenomics</span>
            </a>

            <a href="/whitepaper" className="nav-link">
              <span>Whitepaper</span>
            </a>

            {/* More dropdown */}
            <div className="more-menu">
              <button className="more-button">
                <span style={{ fontSize: '0.8rem' }}>More</span>
                <span className="more-arrow">▾</span>
              </button>

              <div className="more-dropdown" style={{ fontSize: '0.8rem' }}>
                <a href="/about">About</a>
                <a href="/roadmap">Roadmap</a>
                <a href="/faq">FAQ</a>
                <a href="/contact">Contact</a>
              </div>
            </div>
          </nav>

        {/* Right Section */}
        <div className="header-actions">

          {/* Credits */}
          {isConnected && (
            <div className="credits-card">
              <div className="credits-icon">
                ✦
              </div>

              <div className="credits-content">
                <span className="credits-label">
                  Balance
                </span>

                <span className="credits-value">
                  {loading
                    ? '...'
                    : credits.toLocaleString()}
                  <small>Credits</small>
                </span>
              </div>
            </div>
          )}

          {/* Wallet */}
          <button
            type="button"
            onClick={() => open()}
            className={`header-wallet-button ${
              isConnected ? 'connected' : ''
            }`}
          >
            <span className="wallet-status-dot" />

            <span className="wallet-button-content">
              <strong>
                {isConnected
                  ? 'Wallet Connected'
                  : 'Connect Wallet'}
              </strong>

              {isConnected && (
                <small>{shortAddress}</small>
              )}
            </span>

            <span className="wallet-arrow">
              →
            </span>
          </button>

          {/* Mobile Menu */}
          <button
            type="button"
            className={`mobile-menu-button ${
              mobileMenuOpen ? 'open' : ''
            }`}
            onClick={() =>
              setMobileMenuOpen((value) => !value)
            }
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`mobile-nav ${
          mobileMenuOpen ? 'visible' : ''
        }`}
      >
        <a
          href="/home"
          className="mobile-nav-link active"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="mobile-nav-icon">⌂</span>
          Home
        </a>

        <a
          href="/dashboard"
          className="mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="mobile-nav-icon">▣</span>
          Dashboard
        </a>

        <a
          href="/referral"
          className="mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="mobile-nav-icon">↗</span>
          Referral
        </a>

        <a
          href="/tokenomics"
          className="mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="mobile-nav-icon">↗</span>
          Tokenomics
        </a>

        <a
          href="/whitepaper"
          className="mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="mobile-nav-icon">↗</span>
          Whitepapers
        </a>

        <a
          href="/about"
          className="mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="mobile-nav-icon">↗</span>
          About
        </a>

        <a
          href="/roadmap"
          className="mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="mobile-nav-icon">↗</span>
          Roadmap
        </a>

        <a
          href="/faq"
          className="mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="mobile-nav-icon">↗</span>
          FAQ
        </a>
        
        <a
          href="/contact"
          className="mobile-nav-link"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="mobile-nav-icon">↗</span>
          Contact
        </a>

        
        
      </div>
    </header>
  )
}

