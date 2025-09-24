'use client'

import { useState } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
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
  const { address } = useAccount()
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchWalletStats>> | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [txConfirmed, setTxConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)

  const writeContract = useWriteContract()

  const { isLoading: waiting } = useWaitForTransactionReceipt({
    hash: txHash ?? undefined, 
    onSuccess: () => setTxConfirmed(true),
  })

  const handleClick = async () => {
    if (!address) return
    setLoading(true)
    try {
      const hash = await writeContract.writeContractAsync({
        address: CONTRACT_ADDRESS,
        functionName: 'ping',
        abi: CONTRACT_ABI,
        chainId: base.id,
        args: [],
      })

      
      setTxHash(hash as `0x${string}`)

      const apiKey = process.env.BASE_API_KEY || ''
      const result = await fetchWalletStats(address, apiKey)
      setStats(result)
    } catch (err) {
      console.error('Transaction failed:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!address) {
    return (
      <div className={styles.container}>
        <header className={styles.headerWrapper}>
          <p>Please connect your wallet to continue.</p>
        </header>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <div>Welcome,&nbsp;{address}</div>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>BaseState</h1>

        {!txConfirmed ? (
          <button className={styles.button} onClick={handleClick} disabled={loading || waiting}>
            {loading || waiting ? 'Processing...' : 'Log activity and show wallet stats'}
          </button>
        ) : stats ? (
          <WalletStatus stats={stats} />
        ) : null}
      </div>
    </div>
  )
}
