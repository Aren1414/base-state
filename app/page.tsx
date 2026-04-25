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
const DATA_SUFFIX = "0x62635f6c61786875716f670b0080218021802180218021802180218021"

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
        const isFarcasterMiniApp = await sdk.isInMiniApp()
        if (!isFarcasterMiniApp) {
          if (!isFrameReady) setFrameReady()
          return
        }

        const ctx = await sdk.context
        const isBaseApp = String(ctx?.client?.clientFid) === '309857'

        if (!isBaseApp) {
          try {
            await sdk.actions.ready()

            if (ctx?.client && !ctx.client.added) {
              try {
                await sdk.actions.addMiniApp()
              } catch {}
            }

            if (ctx.location?.type !== 'launcher') {
              await signIn()
            }
          } catch {}
        }

        if (!isFrameReady) setFrameReady()
      } catch {
        if (!isFrameReady) setFrameReady()
      }
    }

    initApp()
  }, [isFrameReady, setFrameReady, signIn])

  useEffect(() => {
    const isBaseApp =
      typeof window !== 'undefined' &&
      window.location.href.includes('cbbaseapp://')

    if (!isBaseApp && chainId !== base.id && switchChain) {
      switchChain({ chainId: base.id })
    }
  }, [chainId, switchChain])

  const user = context?.user
  const fid = user?.fid
  const displayName = user?.displayName || fid || walletAddress || 'Guest'
  const ready = fid && walletAddress && chainId === base.id

  
  const handleClick = async () => {
    setLoading(true)
    setTxFailed(false)
    setStats(null)
    setTxConfirmed(false)

    try {
      const data = encodeFunctionData({
        abi: [
          {
            inputs: [],
            name: 'ping',
            outputs: [],
            stateMutability: 'nonpayable',
            type: 'function',
          },
        ],
        functionName: 'ping',
        args: [],
      })

      let tx: string

      if (walletClient) {
        tx = await walletClient.sendTransaction({
          to: CONTRACT_ADDRESS,
          data,
          dataSuffix: DATA_SUFFIX,
        })
      } else if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        })

        if (!accounts?.length) throw new Error('No accounts found')

        const fallbackSigner = createWalletClient({
          chain: base,
          transport: custom(window.ethereum),
        })

        tx = await fallbackSigner.sendTransaction({
          account: accounts[0],
          to: CONTRACT_ADDRESS,
          data,
          dataSuffix: DATA_SUFFIX,
        })
      } else {
        throw new Error('No signer available')
      }

      console.log('Transaction sent:', tx)

      if (!walletAddress) throw new Error('Wallet address is missing')

      const apiKey = process.env.BASE_API_KEY || ''

      
      let result = null

      for (let i = 0; i < 10; i++) {
        result = await fetchWalletStats(walletAddress, apiKey)

        if (result) break

        await new Promise((r) => setTimeout(r, 1500))
      }

      if (!result) {
        throw new Error('Stats not ready yet')
      }

      setStats(result)
      setTxConfirmed(true)
    } catch (err) {
      console.error('Transaction failed:', err)
      setTxFailed(true)
    } finally {
      setLoading(false)
    }
  }

  const handleShareText = async () => {
    if (!stats) return

    const divider = '────────────────────'
    let body = ''

    if (stats.type === 'wallet') {
      const s = stats.data as WalletStats
      body = `📊 Wallet Snapshot\n${divider}\nWallet Age: ${s.walletAge} day\nActive Days: ${s.activeDays}\nTx Count: ${s.txCount}\nBest Streak: ${s.bestStreak} day\nContracts: ${s.contracts}\nTokens: ${s.tokens}\nVolume Sent (ETH): ${s.volumeEth}`
    } else {
      const s = stats.data as ContractStats
      body = `📊 BaseApp Wallet Snapshot\n${divider}\nAge: ${s.age} day\nPost: ${s.postTokens}\nInternal Tx Count: ${s.internalTxCount}\nBest Streak: ${s.bestStreak} day\nUnique Senders: ${s.uniqueSenders}\nTokens Received: ${s.tokensReceived}\nAA Transactions: ${s.allAaTransactions}`
    }

    const castText = `Just checked my ${
      stats.type === 'wallet' ? 'wallet' : 'BaseApp wallet'
    } stats 👇\n\n${body}`

    const embedUrl = `${MINI_APP_URL}?v=${Date.now()}`

    try {
      const isMiniApp = await sdk.isInMiniApp()

      if (isMiniApp) {
        await composeCast({ text: castText, embeds: [embedUrl] })
      } else {
        window.open(
          `https://warpcast.com/~/compose?text=${encodeURIComponent(
            castText
          )}&embeds[]=${encodeURIComponent(embedUrl)}`
        )
      }
    } catch {}
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
              {loading ? 'Submitting transaction...' : 'Submit activity'}
            </button>

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
          </>
        ) : (
          <p className={styles.statusMessage}>
            Fetching wallet stats…{' '}
            <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span>
          </p>
        )}
      </div>
    </div>
  )
}
