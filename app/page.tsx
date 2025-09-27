'use client'

import { useState, useEffect } from 'react'
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWalletClient,
} from 'wagmi'
import { encodeFunctionData, createWalletClient, custom } from 'viem'
import {
  useMiniKit,
  useAuthenticate,
  useComposeCast,
} from '@coinbase/onchainkit/minikit'
import { sdk } from '@farcaster/miniapp-sdk'
import WalletStatus from '../src/components/WalletStatus'
import { fetchWalletStats } from '../src/lib/fetchWalletStats'
import { base } from 'viem/chains'
import styles from './page.module.css'
import type { WalletStats, ContractStats } from '../src/types'

const CONTRACT_ADDRESS = '0xCDbb19b042DFf53F0a30Da02cCfA24fb25fcEb1d'
const MINI_APP_URL = 'https://base-state.vercel.app'
const APP_FID = 1 // ← باید با fid اپ در Farcaster جایگزین بشه

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
  const { signIn } = useAuthenticate()
  const { composeCast } = useComposeCast()
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
    const initMiniApp = async () => {
      const isMiniApp = await sdk.isInMiniApp()
      if (isMiniApp) {
        await sdk.actions.ready()
        await sdk.actions.addMiniApp({
          appFid: APP_FID,
          url: MINI_APP_URL,
        })
        await signIn()
        if (!isFrameReady) {
          setFrameReady()
        }
      }
    }
    initMiniApp()
  }, [isFrameReady, setFrameReady, signIn])

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

  const handleShare = () => {
    if (!stats) return

    const type = stats.type
    const divider = '────────────────────'
    let body = ''

    if (type === 'wallet') {
      const s = stats.data as WalletStats
      body = `📊 Wallet Snapshot\n${divider}\nWallet Age: ${s.walletAge} day\nActive Days: ${s.activeDays}\n\n📈 Activity\n${divider}\nTx Count: ${s.txCount}\nCurrent Streak: ${s.currentStreak} day\nBest Streak: ${s.bestStreak} day\nContracts Interacted: ${s.contracts}\n\n🎯 Tokens & Fees\n${divider}\nTokens Received: ${s.tokens}\nFees Paid (ETH): ${s.feesEth}\nVolume Sent (ETH): ${s.volumeEth}\nWallet Balance (ETH): ${s.balanceEth}`
    } else {
      const s = stats.data as ContractStats
      body = `📊 Contract Snapshot\n${divider}\nAge: ${s.age} day\nFirst Seen: ${s.firstSeen}\nETH Balance: ${s.balanceEth}\n\n📈 Activity\n${divider}\nInternal Tx Count: ${s.internalTxCount}\nActive Days: ${s.activeDays}\nCurrent Streak: ${s.currentStreak} day\nBest Streak: ${s.bestStreak} day\nUnique Senders: ${s.uniqueSenders}\nZero ETH Internal Tx: ${s.zeroEthTx}\nETH Received: ${s.volumeEth}\n\n🎯 Tokens\n${divider}\nTokens Received: ${s.tokensReceived}\nRare Tokens: ${s.rareTokens}\nPost Tokens (MiniApps/Frames): ${s.postTokens}\n\n🧠 AA Metrics\n${divider}\nAll AA Transactions: ${s.allAaTransactions}\nAA Paymaster Success: ${s.aaPaymasterSuccess}`
    }

    const castText = `Just checked my ${type === 'wallet' ? 'wallet' : 'contract'} stats using the BaseState Mini App 👇\n\n${body}`

    const isBaseApp = typeof window !== 'undefined' && window.location.href.includes('cbbaseapp://')

    if (isBaseApp) {
      composeCast({
        text: castText,
        embeds: [MINI_APP_URL],
      })
    } else {
      const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(MINI_APP_URL)}`
      window.open(warpcastUrl, '_blank')
    }
  }

  if (!fid) {
    return (
      <div className={styles.container}>
        <header className={styles.headerCentered}>
          <p className={styles.statusMessage}>Initializing Farcaster session…</p>
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
          <>
            <WalletStatus stats={stats} />
            <button className={styles.actionButton} onClick={handleShare}>Share as Cast</button>
          </>
        ) : (
          <p className={styles.statusMessage}>Fetching wallet stats, please wait…</p>
        )}
      </div>
    </div>
  )
}
