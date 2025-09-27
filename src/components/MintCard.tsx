import React from 'react'
import { uploadToStorj } from '../lib/uploadToStorj'
import { useAccount, useWalletClient } from 'wagmi'
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

export default function MintCard({ stats, type, user, onDownload, onShare, minted, setMintedImageUrl }: MintCardProps) {
  const { address: walletAddress } = useAccount()
  const { data: walletClient } = useWalletClient()

  const handleMint = async () => {
    try {
      if (!walletClient || !walletAddress) throw new Error('Wallet not connected')
      const card = document.getElementById('walletCard')
      if (!card) throw new Error('Card not found')
      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(card, { scale: 2, useCORS: true, backgroundColor: null })
      const imageUrl = await uploadToStorj(canvas)
      setMintedImageUrl(imageUrl)
      const tx = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'mint',
        args: [imageUrl],
        account: walletAddress,
        value: parseEther('0.0001'),
      })
      console.log('✅ Mint tx sent:', tx)
    } catch (err) {
      console.error('❌ Mint failed:', err)
    }
  }

  const fields = type === 'wallet'
    ? [
        { label: 'Wallet Age', value: stats.walletAge + ' days' },
        { label: 'Active Days', value: stats.activeDays },
        { label: 'Tx Count', value: stats.txCount },
        { label: 'Best Streak', value: stats.bestStreak + ' days' },
        { label: 'Contracts', value: stats.contracts },
        { label: 'Tokens Received', value: stats.tokens },
        { label: 'Volume Sent (ETH)', value: stats.volumeEth }
      ]
    : [
        { label: 'Age', value: stats.age + ' days' },
        { label: 'ETH Balance', value: stats.balanceEth },
        { label: 'Internal Tx Count', value: stats.internalTxCount },
        { label: 'Best Streak', value: stats.bestStreak + ' days' },
        { label: 'Unique Senders', value: stats.uniqueSenders },
        { label: 'Tokens Received', value: stats.tokensReceived },
        { label: 'AA Transactions', value: stats.allAaTransactions }
      ]

  return (
    <div style={{ marginTop: '20px', padding: '12px', boxSizing: 'border-box' }}>
      <div id="walletCard" style={{
        width: '100%',
        maxWidth: '600px',
        background: 'linear-gradient(135deg, #00f0ff, #7f00ff)',
        borderRadius: '20px',
        padding: '20px',
        color: '#fff',
        boxShadow: '0 0 24px rgba(0,255,255,0.25)',
        display: 'grid',
        gridTemplateColumns: '140px 1fr',
        gap: '16px',
        position: 'relative',
        margin: '0 auto 20px auto',
        fontFamily: "'Segoe UI', sans-serif",
        boxSizing: 'border-box',
        minHeight: '260px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <img
            src={user.pfpUrl || '/default-avatar.png'}
            alt="pfp"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              border: '2px solid #fff',
              boxShadow: '0 0 6px #00f',
              objectFit: 'cover',
              marginBottom: '8px'
            }}
          />
          <div style={{ fontSize: '16px', fontWeight: 700 }}>@{user.username || 'user'}</div>
          <div style={{ fontSize: '12px', color: '#ccc', marginTop: '2px' }}>FID: {user.fid}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px' }}>
            BaseState {type === 'wallet' ? 'Wallet' : 'Contract'} Report
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '12px',
            fontSize: '12px',
            lineHeight: 1.4
          }}>
            {fields.map((f, i) => (
              <div key={i}><strong>{f.label}</strong><br />{f.value}</div>
            ))}
          </div>
        </div>
        <div style={{
          position: 'absolute',
          bottom: '8px',
          left: '16px',
          fontSize: '11px',
          color: '#ccc'
        }}>
          Powered by BaseState
        </div>
      </div>
      <div style={{
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '12px'
      }}>
        <button onClick={handleMint} style={buttonStyle('#00ff7f')}>🪙 Mint as NFT</button>
        <button onClick={onDownload} style={buttonStyle('#7f00ff')} disabled={!minted}>📥 Download Card</button>
        <button onClick={onShare} style={buttonStyle('#00f0ff')} disabled={!minted}>📸 Share Minted Card</button>
      </div>
    </div>
  )
}

function buttonStyle(color: string): React.CSSProperties {
  return {
    padding: '6px 14px',
    fontSize: '12px',
    background: '#fff',
    color,
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    boxShadow: '0 0 3px rgba(0,0,0,0.1)',
    minWidth: '100px'
  }
}
