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
import { addMiniApp, postCast } from '@coinbase/onchainkit'

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

  const handleShare = async () => {
    if (!stats || !fid) return

    const s = stats.data
    const type = stats.type

    let intro = `🔵 Powered by BaseState Mini App\nExplore your wallet or contract stats and share them with the community.`
    let body = ''

    if (type === 'wallet') {
      body = `📊 Wallet Snapshot\nWallet Age: ${s.walletAge}d | Active: ${s.activeDays}d\n\n📈 Activity\nTxs: ${s.txCount} | Streak: ${s.currentStreak}/${s.bestStreak}d\nContracts: ${s.contracts}\n\n🎯 Tokens & Fees\nReceived: ${s.tokens} | Gas: ${s.feesEth} ETH\nBalance: ${s.balanceEth} ETH`
    } else if (type === 'contract') {
      body = `📊 Contract Snapshot\nAge: ${s.age}d | First Seen: ${s.firstSeen}\nBalance: ${s.balanceEth} ETH\n\n📈 Activity\nInternal Txs: ${s.internalTxCount} | Streak: ${s.currentStreak}/${s.bestStreak}d\nSenders: ${s.uniqueSenders} | Zero ETH Txs: ${s.zeroEthTx}\n\n🎯 Tokens\nReceived: ${s.tokensReceived} | Rare: ${s.rareTokens} | Post: ${s.postTokens}\n\n🧠 AA Metrics\nAA Txs: ${s.allAaTransactions} | Paymaster Success: ${s.aaPaymasterSuccess}`
    }

    const castText = `${intro}\n\n${body}`

    await postCast({
      text: castText,
      embeds: [{ url: window.location.href }],
      fid,
    })
  }

  const handleAddMiniApp = () => {
    addMiniApp()
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
            <button className={styles.retryButton} onClick={handleAddMiniApp}>Add Mini App</button>
          </>
        ) : (
          <p className={styles.statusMessage}>Fetching wallet stats, please wait…</p>
        )}
      </div>
    </div>
  )
      }
