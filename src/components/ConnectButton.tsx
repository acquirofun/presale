'use client'

import { useAppKit, useAppKitAccount } from '@reown/appkit/react'
import { useState, useEffect } from 'react'

export const ConnectButton = () => {
  const { open } = useAppKit()
  const { isConnected } = useAppKitAccount()
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <button 
        className="primary"
        style={{ 
          width: '100%',
          fontSize: '1.125rem', 
          padding: '16px 24px',
          fontWeight: '700',
          background: 'linear-gradient(135deg, #00d4aa 0%, #00ff88 100%)',
          border: 'none',
          color: '#000',
          cursor: 'pointer',
          transition: 'all 0.3s ease'
        }}
      >
        Connect Wallet
      </button>
    )
  }

  return (
    <button 
      onClick={() => open()}
      className="primary"
      style={{ 
        width: '100%',
        fontSize: '1.125rem', 
        padding: '16px 24px',
        fontWeight: '700',
        background: 'linear-gradient(135deg, #00d4aa 0%, #00ff88 100%)',
        border: 'none',
        color: '#000',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0, 212, 170, 0.3)'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      {isConnected ? 'Open Wallet' : 'Connect Wallet'}
    </button>
  )
}
