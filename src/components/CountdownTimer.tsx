
'use client'

import { useEffect, useState } from 'react'

type TimeLeft = {
  days: number
  hours: number
  minutes: number
  seconds: number
}

const TARGET_DATE = new Date('2026-10-15T23:59:00Z').getTime()
const START_DATE = new Date('2026-09-02T23:59:00Z').getTime()

const initialTime: TimeLeft = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0
}

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(initialTime)
  const [progress, setProgress] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    setIsMounted(true)

    const calculateTimeLeft = () => {
      const now = Date.now()
      const difference = TARGET_DATE - now

      if (difference <= 0) {
        setTimeLeft(initialTime)
        setProgress(100)
        setIsExpired(true)
        return
      }

      const days = Math.floor(
        difference / (1000 * 60 * 60 * 24)
      )

      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) /
          (1000 * 60 * 60)
      )

      const minutes = Math.floor(
        (difference % (1000 * 60 * 60)) /
          (1000 * 60)
      )

      const seconds = Math.floor(
        (difference % (1000 * 60)) /
          1000
      )

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds
      })

      const totalDuration = TARGET_DATE - START_DATE
      const elapsed = now - START_DATE

      const progressPercent = Math.min(
        100,
        Math.max(
          0,
          (elapsed / totalDuration) * 100
        )
      )

      setProgress(progressPercent)
      setIsExpired(false)
    }

    calculateTimeLeft()

    const timer = setInterval(
      calculateTimeLeft,
      1000
    )

    return () => clearInterval(timer)
  }, [])

  const countdownItems = [
    {
      value: timeLeft.days,
      label: 'Days'
    },
    {
      value: timeLeft.hours,
      label: 'Hours'
    },
    {
      value: timeLeft.minutes,
      label: 'Minutes'
    },
    {
      value: timeLeft.seconds,
      label: 'Seconds'
    }
  ]

  return (
    <section className="presale-countdown">

      {/* Top Status */}
      <div className="countdown-top">

        <div className="presale-live-badge">
          <span className="live-dot" />
          <span>
            {isExpired
              ? 'Presale Ended'
              : 'Presale Live'}
          </span>
        </div>

        <div className="countdown-label">
          Limited-time offer
        </div>

      </div>


      {/* Heading */}
      <div className="countdown-heading">

        <h2>
          Don&apos;t Miss the
          <span> Presale</span>
        </h2>

        <p>
          Secure your FTT tokens before the
          presale ends.
        </p>

        <a href="#buy-usdc-widget" className="landing-button" style={{ margin: 'var(--spacing-lg) 0' }}>
          BUY NOW
        </a>

      </div>


      {/* Countdown */}
      <div className="countdown-grid">

        {countdownItems.map((item) => (
          <div
            className="countdown-unit"
            key={item.label}
          >

            <div className="countdown-number">
              {isMounted
                ? String(item.value).padStart(2, '0')
                : '--'}
            </div>

            <div className="countdown-unit-label">
              {item.label}
            </div>

          </div>
        ))}

      </div>


      {/* End Date */}
      <div className="countdown-end-date">

        <span className="calendar-icon">
          ◷
        </span>

        <div>
          <span className="end-date-label">
            Presale ends
          </span>

          <strong>
            October 15, 2026 · 11:59 PM GMT
          </strong>
        </div>

      </div>


      {/* Progress */}
      <div className="sale-progress">

        <div className="progress-header">

          <span>Presale progress</span>

          <strong>
            {isMounted
              ? `${progress.toFixed(1)}%`
              : '0.0%'}
          </strong>

        </div>

        <div className="progress-track">

          <div
            className="progress-fill"
            style={{
              width: isMounted
                ? `${progress}%`
                : '0%'
            }}
          >
            <span className="progress-glow" />
          </div>

        </div>

        <div className="progress-footer">
          <span>Presale started</span>
          <span>Ends Oct 15</span>
        </div>

      </div>


      {/* Urgency Message */}
      {!isExpired && (
        <div className="countdown-notice">
          <span className="notice-icon">
            ⚡
          </span>

          <span>
            Early buyers get access before the
            presale closes.
          </span>
        </div>
      )}

      {isExpired && (
        <div className="countdown-notice expired">
          <span className="notice-icon">
            ✓
          </span>

          <span>
            The presale has ended.
          </span>
        </div>
      )}

    </section>
  )
}

