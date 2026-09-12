// src/components/ActionButtonList.tsx
'use client'
import { useDisconnect, useAppKit, useAppKitNetwork } from '@reown/appkit/react'
import { base, polygon, bsc } from '@reown/appkit/networks'
import Image from 'next/image'

export const ActionButtonList = () => {
    const { disconnect } = useDisconnect();
    const { open } = useAppKit();
    const { switchNetwork } = useAppKitNetwork();

    const handleDisconnect = async () => {
      try {
        await disconnect();
      } catch (error) {
        console.error("Failed to disconnect:", error);
      }
    }

  return (
    <div>
      <h3>Wallet Options</h3>
      <p className="text-muted mb-md">Swap, Buy & Switch Networks seamlessly</p>
      <div className="button-grid">
        <button onClick={() => open()} className="primary">Open Wallet<br/>Swap, Buy & Switch</button>
        <button onClick={handleDisconnect} className="secondary">Disconnect</button>
        <button onClick={() => switchNetwork(base)}><Image src="/bass.jpeg" alt="Base" width={40} height={40} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /></button>
        <button onClick={() => switchNetwork(polygon)}><Image src="/pol.png" alt="Polygon" width={40} height={40} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /></button>
        <button onClick={() => switchNetwork(bsc)}><Image src="/bnb.png" alt="BSC" width={40} height={40} style={{ width: '100%', height: '100%', borderRadius: '50%' }} /></button>
        <button 
          onClick={() => alert('Solana transactions are temporarily disabled for security improvements. Please use Base, Polygon, or BSC networks.')}
          disabled={true}
          style={{ opacity: '0.5', cursor: 'not-allowed' }}
        >
          <Image src="/Sola.png" alt="Solana" width={40} height={40} style={{ width: '100%', height: '100%', filter: 'grayscale(100%)', borderRadius: '50%' }} />
        </button>
      </div>
    </div>
  )
}