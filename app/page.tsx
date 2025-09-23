'use client'

import { useState } from 'react'
import { useAuthenticate } from '@coinbase/onchainkit/minikit'
import { useAccount, useWriteContract } from 'wagmi'
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
  const { address } = useAccount()

  const [stats, setStats] = useState<ReturnType<typeof fetchWalletStats> | null>(null)
  const [loading, setLoading] = useState(false)
  const [txConfirmed, setTxConfirmed] = useState(false)

  const { writeContract } = useWriteContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'ping',
    chainId: 8453,
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

  const handlePing = async () => {
    if (!address) return
    setLoading(true)
    writeContract()
  }

  if (!address) {
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
        <div>Welcome, {address}</div>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>BaseState</h1>

        {!txConfirmed ? (
          <button
            className={styles.button}
            onClick={handlePing}
            disabled={loading}
          >
            {loading ? 'Submitting transaction...' : 'Log activity and show wallet stats'}
          </button>
        ) : stats ? (
          <WalletStatus stats={stats} />
        ) : null}
      </div>
    </div>
  )
}
