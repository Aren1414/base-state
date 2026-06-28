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

  const [stats, setStats] =
    useState<Awaited<ReturnType<typeof fetchWalletStats>> | null>(null)
  const [txConfirmed, setTxConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [txFailed, setTxFailed] = useState(false)
  const [mintedImageUrl, setMintedImageUrl] = useState<string | null>(null)
  const [x402Ready, setX402Ready] = useState(false)

  
  useEffect(() => {
    const init = async () => {
      try {
        const insideMini = await sdk.isInMiniApp()
        if (insideMini) {
          await sdk.actions.ready()
          try {
            await signIn()
          } catch {}
        }
        if (!isFrameReady) setFrameReady()
      } catch {
        if (!isFrameReady) setFrameReady()
      }
    }
    init()
  }, [isFrameReady, setFrameReady, signIn])

  
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

  const ready = !!walletAddress && !!walletClient

  const handleClick = async () => {
    if (!ready) return
    setLoading(true)
    setTxFailed(false)

    try {
      
      if (!x402Ready) {
        if (!walletClient) {
          throw new Error('walletClient not ready')
        }
        initX402Client(walletClient as any)
        setX402Ready(true)
      }

      const { fetchWithPayment } = getX402()

      
      const res = await fetchWithPayment(PAID_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      if (!res.ok) {
        throw new Error('payment request failed')
      }

      await res.json()
      setTxConfirmed(true)

      
      const statsRes = await fetch('/api/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: walletAddress }),
      })

      const statsJson = await statsRes.json()
      setStats(statsJson)
    } catch (err) {
      console.error('x402/payment error:', err)
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

  const downloadCard = async () => {
    const card = document.getElementById('walletCard')
    if (!card) return
    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(card, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
    })
    const resizedCanvas = document.createElement('canvas')
    resizedCanvas.width = 1200
    resizedCanvas.height = 800
    const ctx = resizedCanvas.getContext('2d')
    if (!ctx) return
    ctx.drawImage(canvas, 0, 0, resizedCanvas.width, resizedCanvas.height)
    const link = document.createElement('a')
    link.download = 'BaseState_Wallet_Card.png'
    link.href = resizedCanvas.toDataURL('image/png', 0.8)
    link.click()
  }

  if (!isFrameReady) {
    return (
      <div className={styles.container}>
        <header className={styles.headerCentered}>
          <p className={styles.statusMessage}>Initializing Mini App...</p>
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
            <button
              className={styles.actionButton}
              onClick={handleClick}
              disabled={!ready || loading}
            >
              {loading
                ? 'Submitting transaction...'
                : 'Submit activity and retrieve wallet stats'}
            </button>
            {!ready && !loading && (
              <p className={styles.statusMessage}>
                {!walletAddress
                  ? 'Wallet not connected. Please connect your wallet.'
                  : 'Wallet not ready. Please reconnect or reload inside Farcaster/Base App.'}
              </p>
            )}
            {txFailed && (
              <>
                <p className={styles.statusMessage}>
                  Transaction failed. Please try again.
                </p>
                <button className={styles.retryButton} onClick={handleClick}>
                  Retry
                </button>
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
          <p className={styles.statusMessage}>
            Fetching wallet stats, please wait…{' '}
            <span
              style={{
                animation: 'spin 1s linear infinite',
                display: 'inline-block',
              }}
            >
              ⏳
            </span>
          </p>
        )}
      </div>
    </div>
  )
            }
