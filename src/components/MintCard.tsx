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
    <div style={{ marginTop: '24px', padding: '12px', boxSizing: 'border-box' }}>
      <div id="walletCard" style={{
        width: '100%',
        maxWidth: '960px',
        background: 'linear-gradient(135deg, #00f0ff, #7f00ff)',
        borderRadius: '24px',
        padding: '32px',
        paddingLeft: '32px',
        paddingRight: '32px',
        color: '#fff',
        boxShadow: '0 0 48px rgba(0,255,255,0.3)',
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '24px',
        position: 'relative',
        margin: '0 auto 24px auto',
        fontFamily: "'Segoe UI', sans-serif",
        boxSizing: 'border-box',
        minHeight: '360px'
      }}>
        {/* Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginLeft: '4px' }}>
          <img
            src={user.pfpUrl || '/default-avatar.png'}
            alt="pfp"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '2px solid #fff',
              boxShadow: '0 0 8px #00f',
              objectFit: 'cover',
              marginBottom: '12px'
            }}
          />
          <div style={{ fontSize: '18px', fontWeight: 700 }}>@{user.username || 'user'}</div>
          <div style={{ fontSize: '13px', color: '#ccc', marginTop: '4px' }}>FID: {user.fid}</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '16px' }}>
            BaseState {type === 'wallet' ? 'Wallet' : 'Contract'} Report
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)', 
            gap: '16px',
            fontSize: '13px',
            lineHeight: 1.4
          }}>
            {fields.map((f, i) => (
              <div key={i}><strong>{f.label}</strong><br />{f.value}</div>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '24px',
          fontSize: '13px',
          color: '#ccc'
        }}>
          Powered by BaseState
        </div>
      </div>

      {/* Buttons */}
      <div style={{
        textAlign: 'center',
        display: 'flex',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginTop: '16px'
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
    padding: '8px 16px',
    fontSize: '13px',
    background: '#fff',
    color,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 0 4px rgba(0,0,0,0.1)',
    minWidth: '120px'
  }
}
