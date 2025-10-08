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
        await sdk.actions.addMiniApp()
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
        abi: [
          { inputs: [], name: 'ping', outputs: [], stateMutability: 'nonpayable', type: 'function' },
        ],
        functionName: 'ping',
        args: [],
      })

      let tx
      if (walletClient) {
        tx = await walletClient.sendTransaction({ to: CONTRACT_ADDRESS, data })
      } else if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if (!accounts || accounts.length === 0) throw new Error('No accounts found')
        const fallbackSigner = createWalletClient({ chain: base, transport: custom(window.ethereum) })
        tx = await fallbackSigner.sendTransaction({ account: accounts[0], to: CONTRACT_ADDRESS, data })
      } else {
        throw new Error('No signer available')
      }

      console.log('Transaction sent:', tx)
      setTxConfirmed(true)

      const apiKey = process.env.BASE_API_KEY || ''
      if (!walletAddress) throw new Error('Wallet address is missing')
      const result = await fetchWalletStats(walletAddress, apiKey)
      setStats(result)
    } catch (err) {
      console.error('Transaction failed:', err)
      setTxFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleShareText = () => {
    if (!stats) return

    const type = stats.type
    const divider = '────────────────────'
    let body = ''

    if (type === 'wallet') {
      const s = stats.data as WalletStats
      body = `📊 Wallet Snapshot\n${divider}\nWallet Age: ${s.walletAge} day\nActive Days: ${s.activeDays}\nTx Count: ${s.txCount}\nBest Streak: ${s.bestStreak} day\nContracts: ${s.contracts}\nTokens: ${s.tokens}\nVolume Sent (ETH): ${s.volumeEth}`
    } else {
      const s = stats.data as ContractStats
      body = `📊 BaseApp Wallet Snapshot\n${divider}\nAge: ${s.age} day\nPost Token: ${s.postToken}\nInternal Tx Count: ${s.internalTxCount}\nBest Streak: ${s.bestStreak} day\nUnique Senders: ${s.uniqueSenders}\nTokens Received: ${s.tokensReceived}\nAA Transactions: ${s.allAaTransactions}`
    }

    const castText = `Just checked my ${type === 'wallet' ? 'wallet' : 'BaseApp wallet'} stats using the BaseState Mini App 👇\n\n${body}`

    const isBaseApp = typeof window !== 'undefined' && window.location.href.includes('cbbaseapp://')

    if (isBaseApp) {
      composeCast({ text: castText, embeds: [MINI_APP_URL] })
    } else {
      const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(MINI_APP_URL)}`
      window.open(warpcastUrl, '_blank')
    }
  }

  const handleShareImage = () => {
    if (!stats) return
    const type = stats.type
    const body = `Just minted my ${type} stats as an NFT 👇`
    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(body)}&embeds[]=${encodeURIComponent(mintedImageUrl || MINI_APP_URL)}`
    window.open(warpcastUrl, '_blank')
  }

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
            Fetching wallet stats, please wait…
          </p>
        )}
      </div>
    </div>
  )
}
