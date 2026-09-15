
'use client'

import { useState, useEffect, type ChangeEvent } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_KEY'
  )
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ==========================================
// TOKENOMICS CONFIGURATION
// ==========================================

const LAUNCH_PRICE = 0.04

// 60% of total raised money goes to liquidity
const LP_MONEY_PERCENT = 0.60

// Token allocation
const LP_PERCENT = 0.05
const TEAM_PERCENT = 0.10
const PRESALE_PERCENT = 0.30
const Investor_PERCENT = 0.10
const COMMUNITY_PERCENT = 0.15
const LOCKED_PERCENT = 0.30

// Simulator range
const MIN_RAISED = 1
const MAX_RAISED = 5_000_000

export function StatsDashboard() {
  // ==========================================
  // REAL LIVE DATA
  // ==========================================

  const [totalRaised, setTotalRaised] = useState<number>(0)
  const [loading, setLoading] = useState(true)

  // ==========================================
  // SIMULATOR
  // ==========================================

  const [simulationRaised, setSimulationRaised] =
    useState<number>(100_000)

  // ==========================================
  // FETCH CURRENT TOTAL RAISED
  // ==========================================

  useEffect(() => {
    async function fetchTotalRaised() {
      setLoading(true)

      const { data, error } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'SUCCESS')

      if (error) {
        console.error('Error fetching total raised:', error)
        setTotalRaised(0)
        setLoading(false)
        return
      }

      const total = (data || []).reduce(
        (sum, transaction) =>
          sum + Number(transaction.amount || 0),
        0
      )

      setTotalRaised(total)
      setLoading(false)
    }

    fetchTotalRaised()
  }, [])

  // ==========================================
  // SIMULATION CALCULATIONS
  // ==========================================

  // 60% of simulated raised money goes to LP
  const liquidityMoney =
    simulationRaised * LP_MONEY_PERCENT

  // LP tokens based on $0.04 launch price
  const liquidityTokens =
    liquidityMoney / LAUNCH_PRICE

  // LP tokens = 5% of total supply
  const totalSupply =
    liquidityTokens / LP_PERCENT

  // Individual allocations
  const lpTokens =
    totalSupply * LP_PERCENT

  const teamTokens =
    totalSupply * TEAM_PERCENT

  const presaleTokens =
    totalSupply * PRESALE_PERCENT

  const investorTokens =
    totalSupply * Investor_PERCENT

  const communityTokens =
    totalSupply * COMMUNITY_PERCENT

  const lockedTokens =
    totalSupply * LOCKED_PERCENT

  // ==========================================
  // FORMATTERS
  // ==========================================

  const formatUSD = (value: number) =>
    value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

  const formatCompact = (value: number) => {
    if (value >= 1_000_000_000) {
      return `${(value / 1_000_000_000).toFixed(2)}B`
    }

    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`
    }

    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(2)}K`
    }

    return value.toLocaleString('en-US')
  }

  // ==========================================
  // SLIDER
  // ==========================================

  const handleSliderChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    setSimulationRaised(Number(event.target.value))
  }

  // ==========================================
  // DONUT CHART
  // ==========================================

  const chartSegments = [
    {
      name: 'Liquidity Pool',
      percentage: LP_PERCENT * 100,
      color: '#6366f1',
    },
    {
      name: 'Team',
      percentage: TEAM_PERCENT * 100,
      color: '#8b5cf6',
    },
    {
      name: 'Presale',
      percentage: PRESALE_PERCENT * 100,
      color: '#06b6d4',
    },
    {
      name: 'Community',
      percentage: COMMUNITY_PERCENT * 100,
      color: '#10b981',
    },
    {
      name: 'Investors',
      percentage: Investor_PERCENT * 100,
      color: '#ef4444',
    },
    {
      name: 'Locked 1 Year',
      percentage: LOCKED_PERCENT * 100,
      color: '#f59e0b',
    },
  ]

  let cumulativePercentage = 0

  const conicGradient = chartSegments
    .map((segment) => {
      const start = cumulativePercentage

      cumulativePercentage += segment.percentage

      return `${segment.color} ${start}% ${cumulativePercentage}%`
    })
    .join(', ')

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-lg)',
      }}
    >

      {/* ========================================== */}
      {/* CURRENT TOTAL RAISED */}
      {/* ========================================== */}

      <div
        className="card"
        style={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >

        {/* Live indicator */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '8px',
          }}
        >

          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#22c55e',
              display: 'inline-block',
              boxShadow:
                '0 0 10px rgba(34, 197, 94, 0.6)',
            }}
          />

          <span
            className="text-muted"
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            Live Presale
          </span>

        </div>

        <h2
          style={{
            fontSize: '1.15rem',
            fontWeight: 750,
            marginTop: '4px',
            marginBottom: '12px',
          }}
        >
          Total Raised
        </h2>

        <div
          style={{
            fontSize: '2.8rem',
            fontWeight: 900,
            color: 'var(--primary)',
            lineHeight: 1,
          }}
        >
          $
          {loading
            ? '...'
            : formatUSD(totalRaised)}
        </div>

        <div
          className="text-muted"
          style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            marginTop: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          Current successful USDC purchases
        </div>

      </div>

      {/* ========================================== */}
      {/* TOKENOMICS SIMULATOR */}
      {/* ========================================== */}

      <div className="card">

        <span
          className="text-muted"
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Tokenomics Simulator
        </span>

        <h2
          style={{
            fontSize: '1.35rem',
            fontWeight: 800,
            marginTop: '4px',
            marginBottom: '6px',
          }}
        >
          See how the supply changes
        </h2>

        <p
          className="text-muted"
          style={{
            fontSize: '0.82rem',
            lineHeight: 1.5,
            marginBottom: '24px',
          }}
        >
          Move the slider to simulate different
          presale funding levels.
        </p>

        {/* Slider value */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '10px',
          }}
        >

          <span
            className="text-muted"
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
            }}
          >
            Simulated Total Raised
          </span>

          <span
            style={{
              fontSize: '1.25rem',
              fontWeight: 900,
              color: 'var(--primary)',
            }}
          >
            ${formatUSD(simulationRaised)}
          </span>

        </div>

        {/* Slider */}

        <input
          type="range"
          min={MIN_RAISED}
          max={MAX_RAISED}
          step={1}
          value={simulationRaised}
          onChange={handleSliderChange}
          style={{
            width: '100%',
            cursor: 'pointer',
            accentColor: 'var(--primary)',
          }}
        />

        {/* Numeric input */}

        <div
          style={{
            marginTop: '16px',
          }}
        >
          <input
            type="number"
            min={MIN_RAISED}
            max={MAX_RAISED}
            step={1}
            value={simulationRaised}
            onChange={(event) => {
              const value = Number(event.target.value)

              if (Number.isNaN(value)) return

              setSimulationRaised(
                Math.min(
                  MAX_RAISED,
                  Math.max(MIN_RAISED, value)
                )
              )
            }}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: '10px',
              border: '2px dotted #00ff88',
              background: 'var(--card)',
              color: 'inherit',
              fontSize: '0.95rem',
              fontWeight: 700,
              outline: 'none',
            }}
            aria-label="Simulated total raised"
          />
        </div>

        {/* Slider labels */}

        <div
          className="text-muted"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '0px',
            fontSize: '0.68rem',
          }}
        >
          <span>$1</span>
          <span>$5M</span>
        </div>

      </div>

      {/* ========================================== */}
      {/* SIMULATION RESULTS */}
      {/* ========================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 'var(--spacing-lg)',
        }}
      >

        {/* Total Supply */}

        <div className="card">

          <span
            className="text-muted"
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Total Supply
          </span>

          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              color: 'var(--primary)',
              marginTop: '10px',
            }}
          >
            {formatCompact(totalSupply)}
          </div>

          <div
            className="text-muted"
            style={{
              fontSize: '0.68rem',
              marginTop: '5px',
            }}
          >
            Tokens
          </div>

        </div>

        {/* LP Tokens */}

        <div className="card">

          <span
            className="text-muted"
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Liquidity Pool
          </span>

          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              color: 'var(--primary)',
              marginTop: '10px',
            }}
          >
            {formatCompact(lpTokens)}
          </div>

          <div
            className="text-muted"
            style={{
              fontSize: '0.68rem',
              marginTop: '5px',
            }}
          >
            5% of total supply
          </div>

        </div>

        {/* Launch Price */}

        <div className="card">

          <span
            className="text-muted"
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            Launch Price
          </span>

          <div
            style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              color: 'var(--primary)',
              marginTop: '10px',
            }}
          >
            ${LAUNCH_PRICE.toFixed(2)}
          </div>

          <div
            className="text-muted"
            style={{
              fontSize: '0.68rem',
              marginTop: '5px',
            }}
          >
            Per token
          </div>

        </div>

      </div>

      {/* ========================================== */}
      {/* DONUT CHART */}
      {/* ========================================== */}

      <div className="card">

        <span
          className="text-muted"
          style={{
            fontSize: '0.68rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}
        >
          Distribution
        </span>

        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            marginTop: '4px',
            marginBottom: '24px',
          }}
        >
          Token Allocation
        </h2>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '40px',
            flexWrap: 'wrap',
          }}
        >

          {/* Donut */}

          <div
            style={{
              width: '230px',
              height: '230px',
              borderRadius: '50%',
              background:
                `conic-gradient(${conicGradient})`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >

            <div
              style={{
                width: '135px',
                height: '135px',
                borderRadius: '50%',
                background: 'var(--card)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                textAlign: 'center',
              }}
            >

              <span
                className="text-muted"
                style={{
                  fontSize: '0.62rem',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                Total Supply
              </span>

              <strong
                style={{
                  fontSize: '1.05rem',
                  marginTop: '4px',
                }}
              >
                {formatCompact(totalSupply)}
              </strong>

            </div>

          </div>

          {/* Legend */}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              minWidth: '220px',
              flex: 1,
            }}
          >

            {chartSegments.map((segment) => {

              let tokens = 0

              if (segment.name === 'Liquidity Pool') {
                tokens = lpTokens
              }

              if (segment.name === 'Team') {
                tokens = teamTokens
              }

              if (segment.name === 'Presale') {
                tokens = presaleTokens
              }

              if (segment.name === 'Investors') {
                tokens = investorTokens
              }

              if (segment.name === 'Community') {
                tokens = communityTokens
              }

              if (segment.name === 'Locked 1 Year') {
                tokens = lockedTokens
              }

              return (
                <div
                  key={segment.name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '15px',
                  }}
                >

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >

                    <span
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: segment.color,
                        display: 'inline-block',
                        flexShrink: 0,
                      }}
                    />

                    <span
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 650,
                      }}
                    >
                      {segment.name}
                    </span>

                  </div>

                  <div
                    style={{
                      textAlign: 'right',
                    }}
                  >

                    <div
                      style={{
                        fontSize: '0.82rem',
                        fontWeight: 800,
                      }}
                    >
                      {segment.percentage}%
                    </div>

                    <div
                      className="text-muted"
                      style={{
                        fontSize: '0.65rem',
                      }}
                    >
                      {formatCompact(tokens)}
                    </div>

                  </div>

                </div>
              )
            })}

          </div>

        </div>

      </div>

    </div>
  )
}
