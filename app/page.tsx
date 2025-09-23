'use client'

import { useState, useCallback } from 'react'
import { useAuthenticate } from '@coinbase/onchainkit/minikit'
import { useMiniKit } from '@coinbase/minikit'
import { Transaction, TransactionButton, TransactionSponsor, TransactionStatus, TransactionStatusLabel, TransactionStatusAction } from '@coinbase/onchainkit/transaction'
import WalletStatus from '../src/components/WalletStatus'
import { fetchWalletStats } from '../src/lib/fetchWalletStats'
import styles from './page.module.css'
import type { LifecycleStatus } from '@coinbase/onchainkit/transaction'

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

  const [stats, setStats] = useState<ReturnType<typeof fetchWalletStats> | null>(null)
  const [txConfirmed, setTxConfirmed] = useState(false)

  const handleOnStatus = useCallback(
    async (status: LifecycleStatus) => {
      console.log('Transaction status:', status)

      if (status.statusName === 'success') {
        setTxConfirmed(true)
        if (user?.address) {
          const apiKey = process.env.NEXT_PUBLIC_ETHERSCAN_KEY || ''
          const result = await fetchWalletStats(user.address, apiKey)
          setStats(result)
        }
      }
    },
    [user]
  )

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

  // Async call for Transaction component
  const callsCallback = async () => [
    {
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'ping',
      args: [],
    },
  ]

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <div>Welcome, {user.displayName ?? user.address}</div>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>BaseState</h1>

        {!txConfirmed ? (
          <Transaction
            chainId={8453}
            calls={callsCallback}
            onStatus={handleOnStatus}
            isSponsored={true} // Requires Paymaster setup in OnchainKitProvider
          >
            <TransactionButton label="Log activity and show wallet stats" />
            <TransactionSponsor />
            <TransactionStatus>
              <TransactionStatusLabel />
              <TransactionStatusAction />
            </TransactionStatus>
          </Transaction>
        ) : stats ? (
          <WalletStatus stats={stats} />
        ) : null}
      </div>
    </div>
  )
}
