'use client'

import { useState, useEffect } from 'react'
import { calculateCurrentRate } from '@/utils/rateCalculator'

export function OfferInfo() {
  const [rateInfo, setRateInfo] = useState(calculateCurrentRate())
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    const interval = setInterval(() => {
      setRateInfo(calculateCurrentRate())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  if (!isMounted) {
    return (
      <div className="card mb-lg">
        <h3 className="text-center">Current Offer</h3>
        <div className="offer-info-grid" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--spacing-md)',
          marginBottom: 'var(--spacing-md)'
        }}>
          <div className="text-center">
            <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)' }}>
              Current Rate
            </div>
            <div className="text-success" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {rateInfo.currentRate.toLocaleString()}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
              points per USDC
            </div>
          </div>
          <div className="text-center">
            <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)' }}>
              Next Rate
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
              {rateInfo.nextRate.toLocaleString()}
            </div>
            <div className="text-muted" style={{ fontSize: '0.875rem' }}>
              points per USDC
            </div>
          </div>
        </div>
        <div style={{
          background: 'var(--card-bg)',
          padding: 'var(--spacing-md)',
          borderRadius: 'var(--radius-sm)',
          textAlign: 'center'
        }}>
          <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)' }}>
            Rate decreases in
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 'var(--spacing-md)',
            fontSize: '1.25rem',
            fontWeight: '600'
          }}>
            <div>
              <span className="text-warning">--</span>
              <span className="text-muted">d</span>
            </div>
            <div>
              <span className="text-warning">--</span>
              <span className="text-muted">h</span>
            </div>
            <div>
              <span className="text-warning">--</span>
              <span className="text-muted">m</span>
            </div>
            <div>
              <span className="text-warning">--</span>
              <span className="text-muted">s</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card mb-lg">
      <h3 className="text-center">Current Offer</h3>

      <div className="offer-info-grid" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 'var(--spacing-md)',
        marginBottom: 'var(--spacing-md)'
      }}>
        <div className="text-center">
          <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)' }}>
            Current Rate
          </div>
          <div className="text-success" style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            {rateInfo.currentRate.toLocaleString()}
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>
            points per USDC
          </div>
        </div>

        <div className="text-center">
          <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)' }}>
            Next Rate
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-secondary)' }}>
            {rateInfo.nextRate.toLocaleString()}
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem' }}>
            points per USDC
          </div>
        </div>
      </div>

      <div style={{
        background: 'var(--card-bg)',
        padding: 'var(--spacing-md)',
        borderRadius: 'var(--radius-sm)',
        textAlign: 'center'
      }}>
        <div className="text-muted" style={{ fontSize: '0.75rem', textTransform: 'uppercase', marginBottom: 'var(--spacing-xs)' }}>
          Rate decreases in
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 'var(--spacing-md)',
          fontSize: '1.25rem',
          fontWeight: '600'
        }}>
          <div>
            <span className="text-warning">{rateInfo.timeUntilNextRate.days}</span>
            <span className="text-muted">d</span>
          </div>
          <div>
            <span className="text-warning">{rateInfo.timeUntilNextRate.hours}</span>
            <span className="text-muted">h</span>
          </div>
          <div>
            <span className="text-warning">{rateInfo.timeUntilNextRate.minutes}</span>
            <span className="text-muted">m</span>
          </div>
          <div>
            <span className="text-warning">{rateInfo.timeUntilNextRate.seconds}</span>
            <span className="text-muted">s</span>
          </div>
        </div>
      </div>
    </div>
  )
}