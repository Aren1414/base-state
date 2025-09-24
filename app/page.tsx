'use client'

import { useState } from 'react'
import { useAuthenticate, useMiniKit } from '@coinbase/onchainkit/minikit'
import { Transaction, TransactionButton } from '@coinbase/onchainkit/transaction'
import { useAccount } from 'wagmi'
import WalletStatus from '../src/components/WalletStatus'
import { fetchWalletStats } from '../src/lib/fetchWalletStats'
import { base } from 'viem/chains'
import styles from './page.module.css'

const CONTRACT_ADDRESS = '0xCDbb19b042DFf53F0a30Da02cCfA24fb25fcEb1d' as `0x${string}`

const CONTRACT_ABI = [
  { inputs: [], name: 'ping', outputs: [], stateMutability: 'nonpayable', type: 'function' },
  { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'user', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'timestamp', type: 'uint256' },
    ],
    name: 'Ping',
    type: 'event',
  },
  { inputs: [], name: 'owner', outputs: [{ internalType: 'address', name: '', type: 'address' }], stateMutability: 'view', type: 'function' },
]

export default function Home() {
  const { signIn } = useAuthenticate()
  const { context } = useMiniKit()
  const user = context?.user
  const { address } = useAccount()

  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchWalletStats>> | null>(null)
  const [txConfirmed, setTxConfirmed] = useState(false)

  if (!user && !address) {
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

  const calls = [
    { to: CONTRACT_ADDRESS, abi: CONTRACT_ABI, functionName: 'ping', args: [] as const },
  ]

  const handleSuccess = async () => {
    setTxConfirmed(true)
    if (address) {
      const apiKey = process.env.BASE_API_KEY || ''
      const result = await fetchWalletStats(address, apiKey)
      setStats(result)
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <div>
          Welcome,&nbsp;
          {user?.displayName || user?.fid || address || 'Guest'}
        </div>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>BaseState</h1>

        {!txConfirmed ? (
          <Transaction calls={calls} onSuccess={handleSuccess}>
            <TransactionButton
              className={styles.button}
              text="Log activity and show wallet stats"
            />
          </Transaction>
        ) : stats ? (
          <WalletStatus stats={stats} />
        ) : null}
      </div>
    </div>
  )
}
