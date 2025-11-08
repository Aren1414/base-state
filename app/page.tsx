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
import MintCard from '../src/components/MintCard'
import { fetchWalletStats } from '../src/lib/fetchWalletStats'
import { base } from 'viem/chains'
import styles from './page.module.css'
import type { WalletStats, ContractStats } from '../src/types'

const CONTRACT_ADDRESS = '0xCDbb19b042DFf53F0a30Da02cCfA24fb25fcEb1d'
const MINI_APP_URL = 'https://base-state.vercel.app'

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
  const [mintedImageUrl, setMintedImageUrl] = useState<string | null>(null)


useEffect(() => {
  const initApp = async () => {
    try {
      const isFarcasterMiniApp = await sdk.isInMiniApp();
      if (!isFarcasterMiniApp) {
        // Not a Farcaster mini app (regular web or Base-hosted page) — still mark frame ready for MiniKit
        if (!isFrameReady) setFrameReady();
        return;
      }

      // We're in a Mini App environment — fetch context
      const ctx = await sdk.context;

      // Detect Base app by clientFid (Base app's clientFid = 309857 per docs)
      const isBaseApp = String(ctx?.client?.clientFid) === '309857';

      // Only run Farcaster addMiniApp flow when NOT inside Base app
      if (!isBaseApp) {
        try {
          await sdk.actions.ready();

          if (ctx?.client && !ctx.client.added) {
            try {
              await sdk.actions.addMiniApp();
            } catch (err) {
              console.warn('User rejected addMiniApp:', err);
            }
          }

          if (ctx.location?.type !== 'launcher') {
            // signin only for non-launcher launches
            await signIn();
          }
        } catch (err) {
          console.error('Farcaster MiniApp initialization failed:', err);
        }
      }

      // Always set frame ready for Base MiniKit flow (if not already)
      if (!isFrameReady) setFrameReady();
    } catch (err) {
      console.error('initApp error:', err);
      if (!isFrameReady) setFrameReady();
    }
  };

  initApp();
  // deps: keep signIn and frame flags so setFrameReady/signIn are stable
}, [isFrameReady, setFrameReady, signIn]);

useEffect(() => {
  const isBaseApp = typeof window !== 'undefined' && window.location.href.includes('cbbaseapp://')
  if (!isBaseApp && chainId !== base.id && switchChain) {
    switchChain({ chainId: base.id })
  }
}, [chainId, switchChain]);
  
  const user = context?.user
  const fid = user?.fid
  const displayName = user?.displayName || fid || walletAddress || 'Guest'
  const ready = fid && walletAddress && chainId === base.id

  // Handle transaction submission
  const handleClick = async () => {
  setLoading(true)
  setTxFailed(false)

  try {
    const data = encodeFunctionData({
      abi: [
        { inputs: [], name: 'ping', outputs: [], stateMutability: 'nonpayable', type: 'function' },
      ],
      functionName: 'ping',
      args: [],
    })

    let txHash: string | undefined

    if (walletClient) {
      txHash = await walletClient.sendTransaction({ to: CONTRACT_ADDRESS, data })
    } else if (typeof window !== 'undefined' && window.ethereum) {
      const accounts = (await window.ethereum.request({ method: 'eth_accounts' })) as string[]
      if (!accounts || accounts.length === 0) throw new Error('No accounts found')

      const account = accounts[0] as `0x${string}`
      const fallbackSigner = createWalletClient({ chain: base, transport: custom(window.ethereum) })
      txHash = await fallbackSigner.sendTransaction({ account, to: CONTRACT_ADDRESS, data })
    } else {
      throw new Error('No signer available')
    }

    console.log('Transaction sent:', txHash)
    setTxConfirmed(true)

    
    const isFarcasterMiniApp = await sdk.isInMiniApp()
    await new Promise<void>((resolve) => {
      const start = Date.now()
      const interval = setInterval(() => {
        const timeout = Date.now() - start > 10000 
        if (
          (isFarcasterMiniApp && walletAddress && chainId === base.id) ||
          (!isFarcasterMiniApp && walletAddress && chainId === base.id && isFrameReady) ||
          timeout
        ) {
          clearInterval(interval)
          resolve()
        }
      }, 100)
    })

    if (!walletAddress) throw new Error('Wallet address is missing')

    const apiKey = process.env.BASE_API_KEY || ''
    const result = await fetchWalletStats(walletAddress, apiKey)
    setStats(result)
  } catch (err) {
    console.error('Transaction or fetch failed:', err)
    setTxFailed(true)
  } finally {
    setLoading(false)
  }
  }

  // Handle sharing wallet stats
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
      body = `📊 BaseApp Wallet Snapshot\n${divider}\nAge: ${s.age} day\nPost: ${s.postTokens}\nInternal Tx Count: ${s.internalTxCount}\nBest Streak: ${s.bestStreak} day\nUnique Senders: ${s.uniqueSenders}\nTokens Received: ${s.tokensReceived}\nAA Transactions: ${s.allAaTransactions}`
    }

    const castText = `Just checked my ${
      type === 'wallet' ? 'wallet' : 'BaseApp wallet'
    } stats using the BaseState Mini App 👇\n\n${body}`

    const embedUrl = `${MINI_APP_URL}?v=${Date.now()}`

try {
  const isMiniApp = await sdk.isInMiniApp()

  if (isMiniApp) {
    await composeCast({ text: castText, embeds: [embedUrl] })
  } else {
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      castText
    )}&embeds[]=${encodeURIComponent(embedUrl)}`
    window.open(warpcastUrl, '_blank')
  }
} catch (err) {
  console.error('Share failed:', err)
}
  }

  // Download wallet card
  const downloadCard = async () => {
    const card = document.getElementById('walletCard')
    if (!card) return

    const html2canvas = (await import('html2canvas')).default
    const canvas = await html2canvas(card, { scale: 2, useCORS: true, backgroundColor: null })

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
                    Wallet not ready. Please reconnect or reload inside Farcaster/Base App.
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

                {context?.user && walletClient && (
                  <MintCard
                    stats={stats.data}
                    type={stats.type}
                    user={{
                      fid: context.user.fid,
                      username: context.user.username,
                      pfpUrl: context.user.pfpUrl,
                    }}
                    minted={!!mintedImageUrl}
                    setMintedImageUrl={setMintedImageUrl}
                  />
                )}
              </>
            ) : (
              <p className={styles.statusMessage}>
                Fetching wallet stats, please wait…{' '}
                <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
              </p>
            )}
          </div>
        </div>
      )
}
