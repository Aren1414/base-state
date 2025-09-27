import React from 'react'

interface MintCardProps {
  stats: any
  type: 'wallet' | 'contract'
  user: {
    fid: number
    username?: string
    pfp: { url: string }
  }
  onDownload: () => void
  onShare: () => void
}

export default function MintCard({ stats, type, user, onDownload, onShare }: MintCardProps) {
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
    <div style={{ marginTop: '64px' }}>
      <div id="walletCard" style={{
        width: '1200px',
        height: '800px',
        background: 'linear-gradient(135deg, #00f0ff, #7f00ff)',
        borderRadius: '32px',
        padding: '64px',
        color: '#fff',
        boxShadow: '0 0 64px rgba(0,255,255,0.3)',
        display: 'flex',
        position: 'relative',
        margin: '0 auto 32px auto',
        fontFamily: "'Segoe UI', sans-serif"
      }}>
        {/* Profile */}
        <div style={{ width: '320px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left', paddingRight: '64px', borderRight: '1px solid rgba(255,255,255,0.2)' }}>
          <img src={user.pfp.url} alt="pfp" style={{ width: '160px', height: '160px', borderRadius: '50%', border: '4px solid #fff', boxShadow: '0 0 24px #00f', objectFit: 'cover' }} />
          <div style={{ marginTop: '32px', fontSize: '56px', fontWeight: 700 }}>@{user.username || 'user'}</div>
          <div style={{ fontSize: '36px', color: '#ccc' }}>FID: {user.fid}</div>
        </div>

        {/* Stats */}
        <div style={{ flex: 1, paddingLeft: '64px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: '64px', fontWeight: 800 }}>BaseState {type === 'wallet' ? 'Wallet' : 'Contract'} Report</div>
          <div style={{ marginTop: '72px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', fontSize: '36px', lineHeight: 1.2 }}>
            {fields.map((f, i) => (
              <div key={i}><strong>{f.label}</strong><br />{f.value}</div>
            ))}
          </div>
        </div>

        {/* Logo */}
        <div style={{ position: 'absolute', bottom: '48px', right: '64px', fontSize: '28px', color: '#ccc' }}>
          Powered by BaseState
        </div>
      </div>

      {/* Buttons */}
      <div style={{ textAlign: 'center' }}>
        <button onClick={onDownload} style={{ padding: '20px 40px', fontSize: '28px', background: '#fff', color: '#7f00ff', border: 'none', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 0 12px rgba(0,0,0,0.2)', marginRight: '24px' }}>
          📥 download 
        </button>
        <button onClick={onShare} style={{ padding: '20px 40px', fontSize: '28px', background: '#fff', color: '#00f0ff', border: 'none', borderRadius: '16px', cursor: 'pointer', boxShadow: '0 0 12px rgba(0,0,0,0.2)' }}>
          📤 share 
        </button>
      </div>
    </div>
  )
}
