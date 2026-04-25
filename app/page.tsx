'use client'

import { useState, useEffect } from 'react'
import {
  useAccount,
  useChainId,
  useSwitchChain,
  useWalletClient,
} from 'wagmi'
import {
  encodeFunctionData,
  createWalletClient,
  custom,
  waitForTransactionReceipt,
} from 'viem'
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

const DATA_SUFFIX =
  '0x62635f6c61786875716f670b0080218021802180218021802180218021'

export default function Home() {
  const { address: walletAddress } = useAccount()
  const { data: walletClient } = useWalletClient()
  const { context, isFrameReady, setFrameReady } = useMiniKit()
  const { signIn } = useAuthenticate()
  const { composeCast } = useComposeCast()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()

  const [stats, setStats] = useState<any>(null)
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
              } catch (err) {
                console.warn('addMiniApp rejected', err)
              }
            }

            if (ctx.location?.type !== 'launcher') {
              await signIn()
            }
          } catch (err) {
            console.error(err)
          }
        }

        if (!isFrameReady) setFrameReady()
      } catch (err) {
        console.error(err)
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

      let tx: `0x${string}`

      if (walletClient) {
        tx = await walletClient.sendTransaction({
          to: CONTRACT_ADDRESS,
          data,
          dataSuffix: DATA_SUFFIX,
        })

        
        await waitForTransactionReceipt(walletClient, {
          hash: tx,
        })
      } else if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_accounts',
        })

        if (!accounts?.length) throw new Error('No accounts')

        const fallback = createWalletClient({
          chain: base,
          transport: custom(window.ethereum),
        })

        tx = await fallback.sendTransaction({
          account: accounts[0],
          to: CONTRACT_ADDRESS,
          data,
          dataSuffix: DATA_SUFFIX,
        })

        await waitForTransactionReceipt(fallback, {
          hash: tx,
        })
      } else {
        throw new Error('No wallet')
      }

      setTxConfirmed(true)

      const result = await fetchWalletStats(walletAddress!, '')
      setStats(result)
    } catch (err) {
      console.error(err)
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
      body = `Wallet Age: ${s.walletAge}
Active Days: ${s.activeDays}
Tx Count: ${s.txCount}
Best Streak: ${s.bestStreak}
Contracts: ${s.contracts}
Tokens: ${s.tokens}
Volume: ${s.volumeEth}`
    } else {
      const s = stats.data as ContractStats
      body = `Age: ${s.age}
Post: ${s.postTokens}
Tx: ${s.internalTxCount}
Streak: ${s.bestStreak}
Senders: ${s.uniqueSenders}`
    }

    const text = `BaseState Stats 👇\n\n${divider}\n${body}`

    const embedUrl = `${MINI_APP_URL}`

    try {
      const isMini = await sdk.isInMiniApp()

      if (isMini) {
        await composeCast({ text, embeds: [embedUrl] })
      } else {
        window.open(
          `https://warpcast.com/~/compose?text=${encodeURIComponent(text)}`
        )
      }
    } catch (err) {
      console.error(err)
    }
  }

  if (!fid) {
    return (
      <div className={styles.container}>
        <p>Initializing...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <h2>{displayName}</h2>

      {!txConfirmed ? (
        <>
          <button onClick={handleClick} disabled={!ready || loading}>
            {loading ? 'Sending...' : 'Ping'}
          </button>

          {txFailed && <p>Transaction failed</p>}
        </>
      ) : (
        stats && (
          <>
            <WalletStatus stats={stats} />
            <button onClick={handleShareText}>Share</button>

            {context?.user && (
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
        )
      )}
    </div>
  )
}
