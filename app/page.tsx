'use client'
import { useState } from 'react'
import { Wallet, useWallet, sendContractTransaction } from '@coinbase/onchainkit'
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
  const { address } = useWallet()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)
  const [txConfirmed, setTxConfirmed] = useState(false)

  const handlePingAndFetch = async () => {
    if (!address) return
    setLoading(true)

    try {
      const tx = await sendContractTransaction({
        contractAddress: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'ping',
        chainId: 8453,
      })

      if (tx?.receipt?.status === 1) {
        setTxConfirmed(true)
        const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_KEY || ''
        const result = await fetchWalletStats(address, apiKey)
        setStats(result)
      }
    } catch (err) {
      console.error('Contract call failed:', err)
    }

    setLoading(false)
  }

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <Wallet />
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>BaseState</h1>

        {!txConfirmed ? (
          <button className={styles.button} onClick={handlePingAndFetch} disabled={loading}>
            {loading ? 'Submitting transaction...' : 'Log activity and show wallet stats'}
          </button>
        ) : stats ? (
          <WalletStatus stats={stats} />
        ) : null}
      </div>
    </div>
  )
}
