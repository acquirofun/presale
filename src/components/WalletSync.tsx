// src/components/WalletSync.tsx
'use client'

import { useAppKitAccount } from '@reown/appkit/react'
import { useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_KEY'
  )
}

const supabase = createClient(supabaseUrl, supabaseKey)

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