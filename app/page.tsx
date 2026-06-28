'use client'

import { useState, useEffect } from 'react'
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWalletClient,
  useEnsName,
} from 'wagmi'
import {
  useMiniKit,
  useAuthenticate,
  useComposeCast,
} from '@coinbase/onchainkit/minikit'
import { sdk } from '@farcaster/miniapp-sdk'
import { base } from 'viem/chains'
import WalletStatus from '../src/components/WalletStatus'
import MintCard from '../src/components/MintCard'
import { fetchWalletStats } from '../src/lib/fetchWalletStats'
import styles from './page.module.css'
import type { WalletStats, ContractStats } from '../src/types'
import { initX402Client, getX402 } from '../src/lib/x402Client'

const MINI_APP_URL = 'https://base-state.vercel.app'
const PAID_ENDPOINT = '/api/ping'

export default function Home() {
  const { address: walletAddress } = useAccount()
  const { data: walletClient } = useWalletClient({ chainId: base.id })
  const { data: ensName } = useEnsName({ address: walletAddress, chainId: base.id })
  const { context, isFrameReady, setFrameReady } = useMiniKit()
  const { signIn } = useAuthenticate()
  const { composeCast } = useComposeCast()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchWalletStats>> | null>(null)
  const [txConfirmed, setTxConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [txFailed, setTxFailed] = useState(false)
  const [mintedImageUrl, setMintedImageUrl] = useState<string | null>(null)
  const [x402Ready, setX402Ready] = useState(false)

  // MiniKit init
  useEffect(() => {
    const init = async () => {
      try {
        const insideMini = await sdk.isInMiniApp()
        if (insideMini) {
          await sdk.actions.ready()
          try { await signIn() } catch {}
        }
        if (!isFrameReady) setFrameReady()
      } catch {
        if (!isFrameReady) setFrameReady()
      }
    }
    init()
  }, [isFrameReady, setFrameReady, signIn])

  // Auto switch to Base
  useEffect(() => {
    const doSwitch = async () => {
      try {
        if (chainId && chainId !== base.id && switchChain) {
          await switchChain({ chainId: base.id })
        }
      } catch {}
    }
    doSwitch()
  }, [chainId, switchChain])

  const user = context?.user

  const displayName =
    user?.displayName ||
    user?.username ||
    ensName ||
    walletAddress?.slice(0, 6) ||
    'Guest'

  const ready = !!walletAddress

  const handleClick = async () => {
    if (!ready) return
    setLoading(true)
    setTxFailed(false)

    try {
      // Init x402 client once
      if (!x402Ready) {
        if (!walletClient) throw new Error('walletClient not ready')
        initX402Client(walletClient)
        setX402Ready(true)
      }

      const { fetchWithPayment } = getX402()

      // Paid request
      const res = await fetchWithPayment(PAID_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!res.ok) throw new Error('Payment failed')

      await res.json()
      setTxConfirmed(true)

      // Fetch stats
      const statsRes = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress }),
      })

      const statsJson = await statsRes.json()
      setStats(statsJson)
    } catch (err) {
      console.error(err)
      setTxFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleShareText = async () => {
    if (!stats) return
    const type = stats.type
    const divider = '────────────────────'
    let body = ''

    if (type === 'wallet') {
      const s = stats.data as WalletStats
      body = `📊 Wallet Snapshot\n${divider}\nWallet Age: ${s.walletAge} day\nActive Days: ${s.activeDays}\nTx Count: ${s.txCount}\nBest Streak: ${s.bestStreak} day\nContracts: ${s.contracts}\nTokens: ${s.tokens}\nVolume Sent (ETH): ${s.volumeEth}`
    } else {
      const s = stats.data as ContractStats
      body = `📊 BaseApp Wallet Snapshot — Age: ${s.age} day • Post: ${s.postTokens} • Internal Tx Count: ${s.internalTxCount} • Best Streak: ${s.bestStreak} day • Unique Senders: ${s.uniqueSenders} • Tokens Received: ${s.tokensReceived}`
    }

    const castText = `Just checked my ${
      type === 'wallet' ? 'wallet' : 'BaseApp wallet'
    } stats using the BaseState Mini App 👇\n\n${body}`

    const embedUrl = `${MINI_APP_URL}?v=${Date.now()}`

    try {
      const mini = await sdk.isInMiniApp()
      if (mini) {
        await composeCast({ text: castText, embeds: [embedUrl] })
      } else {
        const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
          castText,
        )}&embeds[]=${encodeURIComponent(embedUrl)}`
        window.open(warpcastUrl, '_blank')
      }
    } catch {}
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
            <button
              className={styles.actionButton}
              onClick={handleClick}
              disabled={!ready || loading}
            >
              {loading ? 'Submitting transaction...' : 'Submit activity and retrieve wallet stats'}
            </button>

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

            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <button className={styles.actionButton} onClick={handleShareText}>
                📤 Share Stats as Text
              </button>
            </div>

            {walletClient && (
              <MintCard
                stats={stats.data}
                type={stats.type}
                user={{
                  fid: context?.user?.fid ?? 0,
                  username: context?.user?.username,
                  pfpUrl: context?.user?.pfpUrl,
                }}
                minted={!!mintedImageUrl}
                setMintedImageUrl={setMintedImageUrl}
              />
            )}
          </>
        ) : (
          <p className={styles.statusMessage}>Fetching wallet stats… ⏳</p>
        )}
      </div>
    </div>
  )
    }
