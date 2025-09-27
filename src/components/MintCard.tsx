import React from 'react'
import { uploadToStorj } from '../lib/uploadToStorj'
import { useAccount, useWriteContract } from 'wagmi'
import { parseEther } from 'viem'
import abi from '../lib/abi/BaseStateCard.json'

const CONTRACT_ADDRESS = '0x972f0F6D9f1C25eC153729113048Cdfe6828515c'

interface MintCardProps {
  stats: any
  type: 'wallet' | 'contract'
  user: {
    fid: number
    username?: string
    pfpUrl?: string
  }
  onDownload: () => void
  onShare: () => void
  minted: boolean
  setMintedImageUrl: (url: string) => void
}

export default function MintCard({
  stats,
  type,
  user,
  onDownload,
  onShare,
  minted,
  setMintedImageUrl,
}: MintCardProps) {
  const { address: walletAddress, isConnected } = useAccount()
  const { writeContractAsync } = useWriteContract()

  const handleMint = async () => {
    try {
      if (!isConnected || !walletAddress) throw new Error('Wallet not connected')

      
      const card = document.getElementById('walletCard')
      if (!card) throw new Error('Card not found')
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(card, { scale: 2, useCORS: true, backgroundColor: null })
      const imageUrl = await uploadToStorj(canvas)
      setMintedImageUrl(imageUrl)

      
      const txHash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'mint',
        args: [imageUrl],
        value: parseEther('0.0001'), 
      })

      console.log('✅ Mint tx sent:', txHash)
    } catch (err) {
      console.error('❌ Mint failed:', err)
    }
  }

  const fields =
    type === 'wallet'
      ? [
          { label: 'Wallet Age', value: stats.walletAge + ' days' },
          { label: 'Active Days', value: stats.activeDays },
          { label: 'Tx Count', value: stats.txCount },
          { label: 'Best Streak', value: stats.bestStreak + ' days' },
          { label: 'Contracts', value: stats.contracts },
          { label: 'Tokens Received', value: stats.tokens },
          { label: 'Volume Sent (ETH)', value: stats.volumeEth },
          { label: 'Fees Paid (ETH)', value: stats.feesEth },
        ]
      : [
          { label: 'Age', value: stats.age + ' days' },
          { label: 'ETH Balance', value: stats.balanceEth },
          { label: 'Internal Tx Count', value: stats.internalTxCount },
          { label: 'Best Streak', value: stats.bestStreak + ' days' },
          { label: 'Unique Senders', value: stats.uniqueSenders },
          { label: 'Tokens Received', value: stats.tokensReceived },
          { label: 'AA Transactions', value: stats.allAaTransactions },
          { label: 'Post Tokens', value: stats.postTokens },
        ]

  return (
    <div style={{ marginTop: '16px', padding: '8px', boxSizing: 'border-box' }}>
      <div
        id="walletCard"
        style={{
          width: '100%',
          maxWidth: '380px',
          background: 'linear-gradient(135deg, #00f0ff, #7f00ff)',
          borderRadius: '16px',
          padding: '16px',
          color: '#fff',
          boxShadow: '0 0 20px rgba(0,255,255,0.25)',
          display: 'grid',
          gridTemplateColumns: '90px 1fr',
          gap: '12px',
          position: 'relative',
          margin: '0 auto 16px auto',
          fontFamily: "'Segoe UI', sans-serif",
          boxSizing: 'border-box',
          minHeight: '200px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <img
            src={user.pfpUrl || '/default-avatar.png'}
            alt="pfp"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              border: '2px solid #fff',
              boxShadow: '0 0 4px #00f',
              objectFit: 'cover',
              marginBottom: '6px',
            }}
          />
          <div style={{ fontSize: '14px', fontWeight: 700 }}>@{user.username || 'user'}</div>
          <div style={{ fontSize: '11px', color: '#ccc', marginTop: '2px' }}>FID: {user.fid}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '8px' }}>
            BaseState {type === 'wallet' ? 'Wallet' : 'Contract'} Report
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              fontSize: '11px',
              lineHeight: 1.3,
            }}
          >
            {fields.map((f, i) => (
              <div key={i}>
                <strong>{f.label}</strong>
                <br />
                {f.value}
              </div>
            ))}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            left: '12px',
            fontSize: '10px',
            color: '#ccc',
          }}
        >
          Powered by BaseState
        </div>
      </div>
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '10px',
        }}
      >
        <button onClick={handleMint} style={buttonStyle('#00ff7f')} disabled={!isConnected}>
          🪙 Mint as NFT
        </button>
        <button onClick={onDownload} style={buttonStyle('#7f00ff')} disabled={!minted}>
          📥 Download Card
        </button>
        <button onClick={onShare} style={buttonStyle('#00f0ff')} disabled={!minted}>
          📸 Share Minted Card
        </button>
      </div>
    </div>
  )
}

function buttonStyle(color: string): React.CSSProperties {
  return {
    padding: '5px 12px',
    fontSize: '11px',
    background: '#fff',
    color,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    boxShadow: '0 0 2px rgba(0,0,0,0.1)',
    minWidth: '90px',
  }
}
