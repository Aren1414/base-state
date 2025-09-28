import React, { useState } from 'react'
import { uploadCanvas } from '../lib/uploadCanvas'
import { useAccount, useWalletClient } from 'wagmi'
import { parseEther } from 'viem'
import abi from '../lib/abi/BaseStateCard.json'

const CONTRACT_ADDRESS = '0x972f0F6D9f1C25eC153729113048Cdfe6828515c'
const SHARE_ID = 'jxfrnll6xmowipbfjfhb2xxcrm6q' 

interface MintCardProps {
  stats: any
  type: 'wallet' | 'contract'
  user: {
    fid: number
    username?: string
    pfpUrl?: string
  }
  minted: boolean
}

export default function MintCard({
  stats,
  type,
  user,
  minted,
}: MintCardProps) {
  const { address: walletAddress } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [mintStatus, setMintStatus] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)

  const handleMint = async () => {
    setMintStatus('🧪 Minting…')
    try {
      if (!walletClient || !walletAddress) throw new Error('Wallet not connected')

      const card = document.getElementById('walletCard')
      if (!card) throw new Error('Card not found in DOM')

      const html2canvas = (await import('html2canvas')).default
      const canvas = await html2canvas(card, { scale: 2, useCORS: true, backgroundColor: null })

      const { fileName, downloadUrl } = await uploadCanvas(canvas)
      setDownloadUrl(downloadUrl)

      const tx = await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: 'mint',
        args: [downloadUrl],
        account: walletAddress,
        value: parseEther('0.0001'),
      })

      setMintStatus('✅ Mint successful!')
    } catch (err: any) {
      const message = typeof err === 'string' ? err : err?.message || 'Unknown error'
      setMintStatus(`❌ Mint failed: ${message}`)
    }
  }

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
        
      </div>

      {mintStatus && <div style={{ fontSize: '11px', color: '#ccc', marginTop: '8px', textAlign: 'center' }}>{mintStatus}</div>}

      <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
        <button onClick={handleMint} style={buttonStyle('#00ff7f')} disabled={!walletClient || !walletAddress}>
          🪙 Mint as NFT
        </button>
        <a href={downloadUrl || '#'} download style={{ pointerEvents: downloadUrl ? 'auto' : 'none' }}>
          <button style={buttonStyle('#7f00ff')} disabled={!downloadUrl}>
            📥 Download Card
          </button>
        </a>
      </div>
    </div>
  )
}

function buttonStyle(color: string): React.CSSProperties {
  return { padding: '5px 12px', fontSize: '11px', background: '#fff', color, border: 'none', borderRadius: '6px', cursor: 'pointer', boxShadow: '0 0 2px rgba(0,0,0,0.1)', minWidth: '90px' }
}
