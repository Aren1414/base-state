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
    <div style={{ marginTop: '32px', padding: '16px' }}>
      {/* Card */}
      <div id="walletCard" style={{
        width: '100%',
        maxWidth: '960px',
        aspectRatio: '3 / 2',
        background: 'linear-gradient(135deg, #00f0ff, #7f00ff)',
        borderRadius: '32px',
        padding: '48px',
        color: '#fff',
        boxShadow: '0 0 64px rgba(0,255,255,0.3)',
        display: 'flex',
        flexWrap: 'wrap',
        position: 'relative',
        margin: '0 auto 32px auto',
        fontFamily: "'Segoe UI', sans-serif",
        overflow: 'hidden'
      }}>
        {/* Profile */}
        <div style={{ width: '100%', maxWidth: '320px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', paddingRight: '48px', borderRight: '1px solid rgba(255,255,255,0.2)', marginBottom: '32px' }}>
          <img
            src={user.pfpUrl || '/default-avatar.png'}
            alt="pfp"
            style={{
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              border: '3px solid #fff',
              boxShadow: '0 0 16px #00f',
              objectFit: 'cover'
            }}
          />
          <div style={{ marginTop: '24px', fontSize: '36px', fontWeight: 700 }}>@{user.username || 'user'}</div>
          <div style={{ fontSize: '20px', color: '#ccc' }}>FID: {user.fid}</div>
        </div>

        {/* Stats */}
        <div style={{ flex: 1, paddingLeft: '48px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '36px', fontWeight: 800 }}>BaseState {type === 'wallet' ? 'Wallet' : 'Contract'} Report</div>
          <div style={{ marginTop: '32px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '20px', lineHeight: 1.4 }}>
            {fields.map((f, i) => (
              <div key={i}><strong>{f.label}</strong><br />{f.value}</div>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div style={{ position: 'absolute', bottom: '24px', right: '32px', fontSize: '18px', color: '#ccc' }}>
          Powered by BaseState
        </div>
      </div>

      {/* Buttons */}
      <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <button onClick={onMint} style={buttonStyle('#00ff7f')}>🪙 Mint as NFT</button>
        <button onClick={onDownload} style={buttonStyle('#7f00ff')} disabled={!minted}>📥 Download Card</button>
        <button onClick={onShare} style={buttonStyle('#00f0ff')} disabled={!minted}>📸 Share Minted Card</button>
      </div>
    </div>
  )
}

function buttonStyle(color: string): React.CSSProperties {
  return {
    padding: '12px 24px',
    fontSize: '18px',
    background: '#fff',
    color,
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 0 8px rgba(0,0,0,0.1)',
    minWidth: '160px'
  }
}
