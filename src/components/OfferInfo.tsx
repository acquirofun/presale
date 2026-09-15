
'use client'

import { useState, useEffect } from 'react'
import { calculateCurrentRate } from '@/utils/rateCalculator'

interface RateInfo {
  currentRate: number
  nextRate: number
  timeUntilNextRate: {
    days: number
    hours: number
    minutes: number
    seconds: number
  }
}

const formatNumber = (value: number) => {
  return value.toLocaleString()
}

const padNumber = (value: number) => {
  return value.toString().padStart(2, '0')
}

export function OfferInfo() {
  const [rateInfo, setRateInfo] = useState<RateInfo>(
    calculateCurrentRate()
  )

  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const updateRate = () => {
      setRateInfo(calculateCurrentRate())
    }

    updateRate()

    const interval = setInterval(updateRate, 1000)

    return () => clearInterval(interval)
  }, [])

  const displayRateInfo = isMounted
    ? rateInfo
    : {
        currentRate: 0,
        nextRate: 0,
        timeUntilNextRate: {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        },
      }

  return (
    <section className="offer-card">

      {/* Header */}
      <div className="offer-header">
        <div>
          <div className="offer-eyebrow">
            <span className="offer-live-dot" />
            LIVE PRESALE RATE
          </div>

          <h2 className="offer-title">
            Current <span>Offer</span>
          </h2>

          <p className="offer-subtitle">
            Buy Credits at the current presale rate before it decreases.
          </p>
        </div>

        <div className="offer-badge">
          <span>⚡</span>
          Dynamic Rate
        </div>
      </div>


      {/* Rate Cards */}
      <div className="offer-rates">

        {/* Current Rate */}
        <div className="rate-card rate-card-current">

          <div className="rate-card-top">
            <span className="rate-label">
              Current Rate
            </span>

            <span className="rate-status">
              ACTIVE
            </span>
          </div>

          <div className="rate-main">
            <span className="rate-number">
              {isMounted
                ? formatNumber(displayRateInfo.currentRate)
                : '--'}
            </span>
          </div>

          <div className="rate-unit">
            Credits <span>PER USDC</span>
          </div>

          <div className="rate-description">
            Best available rate
          </div>
        </div>


        {/* Arrow */}
        <div className="rate-transition">
          <div className="rate-arrow">
            ↓
          </div>

          <span>Next</span>
        </div>


        {/* Next Rate */}
        <div className="rate-card rate-card-next">

          <div className="rate-card-top">
            <span className="rate-label">
              Next Rate
            </span>

            <span className="rate-status next">
              UPCOMING
            </span>
          </div>

          <div className="rate-main">
            <span className="rate-number">
              {isMounted
                ? formatNumber(displayRateInfo.nextRate)
                : '--'}
            </span>
          </div>

          <div className="rate-unit">
            Credits <span>PER USDC</span>
          </div>

          <div className="rate-description">
            Rate decreases after timer
          </div>
        </div>

      </div>


      {/* Countdown */}
      <div className="rate-countdown">

        <div className="countdown-header">
          <div className="countdown-title">
            <span className="countdown-clock">
              ◷
            </span>

            <div>
              <strong>Rate decreases in</strong>
              <span>Secure the current rate before it changes</span>
            </div>
          </div>

          <div className="countdown-live">
            LIVE
          </div>
        </div>


        <div className="rate-timer">

          {/* Days */}
          <div className="timer-box">
            <div className="timer-number">
              {isMounted
                ? padNumber(displayRateInfo.timeUntilNextRate.days)
                : '--'}
            </div>

            <div className="timer-label">
              DAYS
            </div>
          </div>

          <div className="timer-separator">:</div>

          {/* Hours */}
          <div className="timer-box">
            <div className="timer-number">
              {isMounted
                ? padNumber(displayRateInfo.timeUntilNextRate.hours)
                : '--'}
            </div>

            <div className="timer-label">
              HOURS
            </div>
          </div>

          <div className="timer-separator">:</div>

          {/* Minutes */}
          <div className="timer-box">
            <div className="timer-number">
              {isMounted
                ? padNumber(displayRateInfo.timeUntilNextRate.minutes)
                : '--'}
            </div>

            <div className="timer-label">
              MINUTES
            </div>
          </div>

          <div className="timer-separator">:</div>

          {/* Seconds */}
          <div className="timer-box timer-box-seconds">
            <div className="timer-number">
              {isMounted
                ? padNumber(displayRateInfo.timeUntilNextRate.seconds)
                : '--'}
            </div>

            <div className="timer-label">
              SECONDS
            </div>
          </div>

        </div>

      </div>


      {/* Bottom Notice */}
      <div className="offer-notice">
        <div className="notice-icon">
          ✓
        </div>

        <div>
          <strong>
            Current rate is locked in for this period
          </strong>

          <span>
            Your purchase will use the rate displayed above.
          </span>
        </div>
      </div>

    </section>
  )
}

