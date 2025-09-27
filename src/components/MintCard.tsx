import React from 'react'

interface MintCardProps {
  stats: any
  type: 'wallet' | 'contract'
  user: {
    fid: number
    username?: string
    pfpUrl?: string
  }
  onDownload: () => void
  onMint: () => void
  onShare: () => void
  minted: boolean
}

export default function MintCard({ stats, type, user, onDownload, onMint, onShare, minted }: MintCardProps) {
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
      {/* Card */}
      <div id="walletCard" style={{
        width: '100%',
        maxWidth: '960px',
        aspectRatio: '3 / 2',
        background: 'linear-gradient(135deg, #00f0ff, #7f00ff)',
        borderRadius: '24px',
        padding: '24px',
        color: '#fff',
        boxShadow: '0 0 48px rgba(0,255,255,0.3)',
        display: 'grid',
        gridTemplateColumns: '240px 1fr',
        gap: '24px',
        position: 'relative',
        margin: '0 auto 24px auto',
        fontFamily: "'Segoe UI', sans-serif",
        overflow: 'hidden',
        boxSizing: 'border-box'
      }}>
        {/* Profile */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
          <img
            src={user.pfpUrl || '/default-avatar.png'}
            alt="pfp"
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              border: '2px solid #fff',
              boxShadow: '0 0 8px #00f',
              objectFit: 'cover'
            }}
          />
          <div style={{ marginTop: '12px', fontSize: '20px', fontWeight: 700 }}>@{user.username || 'user'}</div>
          <div style={{ fontSize: '14px', color: '#ccc' }}>FID: {user.fid}</div>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <div style={{ fontSize: '20px', fontWeight: 800 }}>BaseState {type === 'wallet' ? 'Wallet' : 'Contract'} Report</div>
          <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px', lineHeight: 1.4 }}>
            {fields.map((f, i) => (
              <div key={i}><strong>{f.label}</strong><br />{f.value}</div>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div style={{ position: 'absolute', bottom: '12px', right: '20px', fontSize: '14px', color: '#ccc' }}>
          Powered by BaseState
        </div>
      </div>

      {/* Buttons */}
      <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <button onClick={onMint} style={buttonStyle('#00ff7f')}>🪙 Mint as NFT</button>
        <button onClick={onDownload} style={buttonStyle('#7f00ff')} disabled={!minted}>📥 Download Card</button>
        <button onClick={onShare} style={buttonStyle('#00f0ff')} disabled={!minted}>📸 Share Minted Card</button>
      </div>
    </div>
  )
}

function buttonStyle(color: string): React.CSSProperties {
  return {
    padding: '8px 16px',
    fontSize: '14px',
    background: '#fff',
    color,
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    boxShadow: '0 0 4px rgba(0,0,0,0.1)',
    minWidth: '120px'
  }
}
