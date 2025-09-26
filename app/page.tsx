'use client'

import { useState, useEffect } from 'react'
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWalletClient,
} from 'wagmi'
import { encodeFunctionData, createWalletClient, custom, parseUnits } from 'viem'
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
  const { address: walletAddress, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { context, isFrameReady, setFrameReady } = useMiniKit()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchWalletStats>> | null>(null)
  const [txConfirmed, setTxConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)

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

  const ready = fid && isConnected && walletAddress && chainId === base.id

  const handleClick = async () => {
    setLoading(true)
    try {
      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: 'ping',
        args: [],
      })

      let tx

      if (walletClient) {
        const gasEstimate = await walletClient.estimateGas({
          to: CONTRACT_ADDRESS,
          data,
        })

        tx = await walletClient.sendTransaction({
          to: CONTRACT_ADDRESS,
          data,
          gas: gasEstimate,
          maxFeePerGas: parseUnits('5', 'gwei'),
          maxPriorityFeePerGas: parseUnits('1', 'gwei'),
        })
      } else if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (!accounts || accounts.length === 0) throw new Error('No accounts found in fallback signer')

        const fallbackSigner = createWalletClient({
          chain: base,
          transport: custom(window.ethereum),
        })

        const gasEstimate = await fallbackSigner.estimateGas({
          account: accounts[0],
          to: CONTRACT_ADDRESS,
          data,
        })

        tx = await fallbackSigner.sendTransaction({
          account: accounts[0],
          to: CONTRACT_ADDRESS,
          data,
          gas: gasEstimate,
          maxFeePerGas: parseUnits('5', 'gwei'),
          maxPriorityFeePerGas: parseUnits('1', 'gwei'),
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
    } finally {
      setLoading(false)
    }
  }

  if (!fid) {
    return (
      <div className={styles.container}>
        <header className={styles.headerWrapper}>
          <p>Waiting for Farcaster context...</p>
        </header>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <header className={styles.headerWrapper}>
        <div>
          Welcome,&nbsp;
          {user?.displayName || fid || walletAddress || 'Guest'}
        </div>
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>BaseState</h1>

        {!txConfirmed ? (
          <>
            <button className={styles.button} onClick={handleClick} disabled={!ready || loading}>
              {loading ? 'Processing...' : 'Log activity and show wallet stats'}
            </button>
            {!ready && (
              <p style={{ opacity: 0.6, fontFamily: 'monospace', marginTop: 12 }}>
                Wallet not ready. Try reconnecting or reload inside Farcaster/Base App.
              </p>
            )}
          </>
        ) : stats ? (
          <WalletStatus stats={stats} />
        ) : (
          <p style={{ opacity: 0.6, fontFamily: 'monospace' }}>
            No wallet stats available. Try again or check API response.
          </p>
        )}
      </div>
    </div>
  )
}
