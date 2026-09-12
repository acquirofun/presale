'use client'

import { useState, useEffect } from 'react'

export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  })
  const [progress, setProgress] = useState(0)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    // Target date: 15/11/2026 11:59pm GMT
    const targetDate = new Date('2026-10-15T23:59:00Z')
    const startDate = new Date('2026-09-02T23:59:00Z') // Start date for progress calculation
    const totalDuration = targetDate.getTime() - startDate.getTime()

    const calculateTimeLeft = () => {
      const now = new Date()
      const difference = targetDate.getTime() - now.getTime()
      const elapsed = now.getTime() - startDate.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((difference % (1000 * 60)) / 1000)

        setTimeLeft({ days, hours, minutes, seconds })
        
        // Calculate progress percentage
        const progressPercent = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100))
        setProgress(progressPercent)
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 })
        setProgress(100)
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [])

  if (!isMounted) {
    return (
      <div className="card mb-lg">
        <h2 className="text-center" style={{ fontSize: '2rem', marginBottom: 'var(--spacing-md)' }}>
          PRESALE IS LIVE
        </h2>
        <p className="text-center text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
          BUY IT OR MISS IT! <br/>The presale ends on 15/10/2026 at 11:59pm GMT. Don&apos;t miss your chance to be part of this exclusive opportunity.
        </p>

        <div className="countdown-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 'var(--spacing-md)',
          textAlign: 'center',
          marginBottom: 'var(--spacing-lg)'
        }}>
          <div>
            <div className="text-success" style={{ fontSize: '3rem', fontWeight: '700', lineHeight: '1' }}>
              --
            </div>
          <div className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase', marginTop: 'var(--spacing-xs)' }}>
            Days
          </div>
        </div>
        <div>
          <div className="text-success" style={{ fontSize: '3rem', fontWeight: '700', lineHeight: '1' }}>
            --
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase', marginTop: 'var(--spacing-xs)' }}>
            Hours
          </div>
        </div>
        <div>
          <div className="text-success" style={{ fontSize: '3rem', fontWeight: '700', lineHeight: '1' }}>
            --
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase', marginTop: 'var(--spacing-xs)' }}>
            Minutes
          </div>
        </div>
        <div>
          <div className="text-success" style={{ fontSize: '3rem', fontWeight: '700', lineHeight: '1' }}>
            --
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase', marginTop: 'var(--spacing-xs)' }}>
            Seconds
          </div>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: '0%' }}
        />
      </div>

      <div className="text-center" style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--primary)' }}>
        0% Complete
      </div>
    </div>
    )
  }

  return (
    <div className="card mb-lg">
      <h2 className="text-center" style={{ fontSize: '2rem', marginBottom: 'var(--spacing-md)' }}>
        PRESALE IS LIVE
      </h2>
      <p className="text-center text-muted" style={{ marginBottom: 'var(--spacing-lg)' }}>
        BUY IT OR MISS IT! <br/>The presale ends on 15/10/2026 at 11:59pm GMT. Don&apos;t miss your chance to be part of this exclusive opportunity.
      </p>

      <div className="countdown-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 'var(--spacing-md)',
        textAlign: 'center',
        marginBottom: 'var(--spacing-lg)'
      }}>
        <div>
          <div className="text-success" style={{ fontSize: '3rem', fontWeight: '700', lineHeight: '1' }}>
            {String(timeLeft.days).padStart(2, '0')}
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase', marginTop: 'var(--spacing-xs)' }}>
            Days
          </div>
        </div>
        <div>
          <div className="text-success" style={{ fontSize: '3rem', fontWeight: '700', lineHeight: '1' }}>
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase', marginTop: 'var(--spacing-xs)' }}>
            Hours
          </div>
        </div>
        <div>
          <div className="text-success" style={{ fontSize: '3rem', fontWeight: '700', lineHeight: '1' }}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase', marginTop: 'var(--spacing-xs)' }}>
            Minutes
          </div>
        </div>
        <div>
          <div className="text-success" style={{ fontSize: '3rem', fontWeight: '700', lineHeight: '1' }}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <div className="text-muted" style={{ fontSize: '0.875rem', textTransform: 'uppercase', marginTop: 'var(--spacing-xs)' }}>
            Seconds
          </div>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="text-center" style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--primary)' }}>
        {progress.toFixed(1)}% Complete
      </div>
    </div>
  )
}