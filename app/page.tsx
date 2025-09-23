'use client'

import { useState, useCallback } from 'react'
import { useAuthenticate, useMiniKit } from '@coinbase/onchainkit/minikit'
import { useWriteContract } from 'wagmi'
import WalletStatus from '../src/components/WalletStatus'
import { fetchWalletStats } from '../src/lib/fetchWalletStats'
import styles from './page.module.css'

const CONTRACT_ADDRESS = '0xCDbb19b042DFf53F0a30Da02cCfA24fb25fcEb1d'

const CONTRACT_ABI = [
  {
    inputs: [],
    name: 'ping',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
]

export default function Home() {
  const { signIn } = useAuthenticate()
  const { context } = useMiniKit()
  const user = context?.user
  const address = user?.address

  const [stats, setStats] = useState<ReturnType<typeof fetchWalletStats> | null>(null)
  const [loading, setLoading] = useState(false)
  const [txConfirmed, setTxConfirmed] = useState(false)

  const { write } = useWriteContract({
    chainId: 8453,
    request: {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'ping',
      args: [],
    },
    onSuccess: async () => {
      setTxConfirmed(true)
      if (address) {
        const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_KEY || ''
        const result = await fetchWalletStats(address, apiKey)
        setStats(result)
      }
      setLoading(false)
    },
    onError: (error) => {
      console.error('Contract call failed:', error)
      setLoading(false)
    },
  })

  const handlePing = useCallback(async () => {
    if (!address) return
    setLoading(true)
    write()
  }, [address, write])

  if (!user) {
    return (
      <div className={styles.container}>
        <header className={styles.headerWrapper}>
          <button className={styles.button} onClick={() => signIn()}>
            Sign in
          </button>
        </header>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <div>
          Welcome, {user.displayName ?? user.address}
        </div>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>BaseState</h1>

        {!txConfirmed ? (
          <button
            className={styles.button}
            onClick={handlePing}
            disabled={loading}
          >
            {loading
              ? 'Submitting transaction...'
              : 'Log activity and show wallet stats'}
          </button>
        ) : stats ? (
          <WalletStatus stats={stats} />
        ) : null}
      </div>
    </div>
  )
    }
