'use client'

import { useState, useEffect } from 'react'
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWalletClient,
} from 'wagmi'
import { encodeFunctionData, createWalletClient, custom } from 'viem'
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
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  
  const [fid, setFid] = useState<number | null>(null)
  const [displayName, setDisplayName] = useState('Guest')
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchWalletStats>> | null>(null)
  const [txConfirmed, setTxConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [txFailed, setTxFailed] = useState(false)
  const [mintedImageUrl, setMintedImageUrl] = useState<string | null>(null)

  useEffect(() => {
    if (chainId !== base.id && switchChain) {
      switchChain({ chainId: base.id })
    }
  }, [chainId, switchChain])

  useEffect(() => {
    const initFarcaster = async () => {
      try {
        const isMiniApp = await sdk.isInMiniApp()
        if (isMiniApp) {
          await sdk.actions.ready()
          const ctx = await sdk.context
          if (ctx?.user?.fid) {
            setFid(ctx.user.fid) 
            setDisplayName(ctx.user.displayName || ctx.user.fid.toString())
          }
        }
      } catch (err) {
        console.error('Farcaster initialization failed:', err)
      }
    }

    initFarcaster()
  }, [])

  const ready = fid !== null && !!walletAddress && chainId === base.id

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
    } stats 👇\n\n${body}`

    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(castText)}&embeds[]=${encodeURIComponent(MINI_APP_URL)}`
    window.open(warpcastUrl, '_blank')
  }

  if (fid === null) {
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
              {loading ? 'Submitting transaction...' : 'Submit activity and retrieve wallet stats'}
            </button>

            {!ready && !loading && (
              <p className={styles.statusMessage}>
                Wallet not ready. Please connect your wallet.
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

            <div style={{ textAlign: 'center', margin: '32px 0' }}>
              <button className={styles.actionButton} onClick={handleShareText}>
                📤 Share Stats as Text
              </button>
            </div>

            {walletAddress && (
              <MintCard
                stats={stats.data}
                type={stats.type}
                user={{ fid, username: displayName, pfpUrl: '' }} 
                minted={!!mintedImageUrl}
                setMintedImageUrl={setMintedImageUrl}
              />
            )}
          </>
        ) : (
          <p className={styles.statusMessage}>
            Fetching wallet stats, please wait… <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
          </p>
        )}
      </div>
    </div>
  )
}
