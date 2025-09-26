'use client'

import { useState, useEffect } from 'react'
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWalletClient,
} from 'wagmi'
import { encodeFunctionData, createWalletClient, custom } from 'viem'
import { useMiniKit } from '@coinbase/onchainkit/minikit'
import WalletStatus from '../src/components/WalletStatus'
import { fetchWalletStats } from '../src/lib/fetchWalletStats'
import { base } from 'viem/chains'
import styles from './page.module.css'

const CONTRACT_ADDRESS = '0xCDbb19b042DFf53F0a30Da02cCfA24fb25fcEb1d'
const CONTRACT_ABI = [
  { inputs: [], name: 'ping', outputs: [], stateMutability: 'nonpayable', type: 'function' },
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
  const { address: walletAddress } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { context, isFrameReady, setFrameReady } = useMiniKit()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchWalletStats>> | null>(null)
  const [txConfirmed, setTxConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [txFailed, setTxFailed] = useState(false)

  useEffect(() => {
    const isBaseApp = typeof window !== 'undefined' && window.location.href.includes('cbbaseapp://')
    if (!isBaseApp && chainId !== base.id && switchChain) {
      switchChain({ chainId: base.id })
    }
  }, [chainId, switchChain])

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady()
    }
  }, [isFrameReady, setFrameReady])

  const user = context?.user
  const fid = user?.fid
  const displayName = user?.displayName || fid || walletAddress || 'Guest'

  const ready = fid && walletAddress && chainId === base.id

  const handleClick = async () => {
    setLoading(true)
    setTxFailed(false)
    try {
      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'ping',
        args: [],
      })

      let tx

      if (walletClient) {
        tx = await walletClient.sendTransaction({
          to: CONTRACT_ADDRESS,
          data,
        })
      } else if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (!accounts || accounts.length === 0) throw new Error('No accounts found in fallback signer')

        const fallbackSigner = createWalletClient({
          chain: base,
          transport: custom(window.ethereum),
        })

        tx = await fallbackSigner.sendTransaction({
          account: accounts[0],
          to: CONTRACT_ADDRESS,
          data,
        })
      } else {
        throw new Error('No signer available')
      }

      console.log('Transaction sent:', tx)
      setTxConfirmed(true)

      const apiKey = process.env.BASE_API_KEY || ''
      if (!walletAddress) throw new Error('Wallet address is missing')
      const result = await fetchWalletStats(walletAddress, apiKey)
      console.log('Wallet stats result:', result)
      setStats(result)
    } catch (err) {
      console.error('Transaction failed:', err)
      setTxFailed(true)
    } finally {
      setLoading(false)
    }
  }

  if (!fid) {
    return (
      <div className={styles.container}>
        <header className={styles.headerCentered}>
          <p>Waiting for Farcaster context...</p>
        </header>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.headerCentered}>
        <h2 className={styles.userName}>{displayName}</h2>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>BaseState</h1>

        {!txConfirmed ? (
          <>
            <button className={styles.actionButton} onClick={handleClick} disabled={!ready || loading}>
              {loading ? 'Submitting transaction...' : 'Submit activity and retrieve wallet stats'}
            </button>

            {!ready && !loading && (
              <p className={styles.statusMessage}>
                Wallet not ready. Please reconnect or reload inside Farcaster/Base App.
              </p>
            )}

            {txFailed && (
              <>
                <p className={styles.statusMessage}>Transaction failed. Please try again.</p>
                <button className={styles.retryButton} onClick={handleClick}>Retry</button>
              </>
            )}
          </>
        ) : stats ? (
          <WalletStatus stats={stats} />
        ) : (
          <p className={styles.statusMessage}>Fetching wallet stats, please wait…</p>
        )}
      </div>
    </div>
  )
    }
