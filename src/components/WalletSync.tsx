// src/components/WalletSync.tsx
'use client'

import { useAppKitAccount } from '@reown/appkit/react'
import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL || "https://kifydthslaqeqmohvetb.supabase.co", 
  process.env.SUPABASE_KEY || "sb_publishable_gPldRZjoctXxbEuEmy1GjA_EjzSLjqk"
)

export default function WalletSync() {
  const { address, isConnected, caipAddress } = useAppKitAccount()

  useEffect(() => {
    async function saveWalletToSupabase() {
      if (isConnected && address) {
        const chainType = caipAddress ? caipAddress.split(':')[0] : 'multichain'

        const { error } = await supabase
          .from('connected_wallets')
          .upsert(
            { 
              address: address.toLowerCase(), 
              chain_type: chainType,
              connected_at: new Date() 
            },
            { onConflict: 'address' }
          )

        if (error) {
          console.error('Failed to save wallet info to Supabase:', error.message)
        }
      }
    }

    saveWalletToSupabase()
  }, [isConnected, address, caipAddress])

  return null
}