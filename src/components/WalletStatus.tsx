'use client'
import React from 'react'
import type { WalletStats, ContractStats } from '../types'

type WalletStats = {
  walletAge: number
  activeDays: number
  txCount: number
  currentStreak: number
  bestStreak: number
  contracts: number
  tokens: number
  feesEth: string
  volumeEth: string
  balanceEth: string
}

type ContractStats = {
  age: number
  firstSeen: string
  balanceEth: string
  internalTxCount: number
  activeDays: number
  currentStreak: number
  bestStreak: number
  uniqueSenders: number
  zeroEthTx: number
  volumeEth: string
  tokensReceived: number
  rareTokens: number
  postTokens: number
  allAaTransactions: number
  aaPaymasterSuccess: number
}

type AddressStats =
  | { type: 'wallet'; data: WalletStats }
  | { type: 'contract'; data: ContractStats }

const containerStyle: React.CSSProperties = {
  fontFamily: 'monospace',
  lineHeight: '1.8',
  padding: '1rem',
  width: '100%',
  maxWidth: '600px',
  margin: '0 auto',
  boxSizing: 'border-box',
}

const section = (title: string, children: React.ReactNode) => (
  <div style={{ marginBottom: '1rem' }}>
    <div><strong>{title}</strong></div>
    <div style={{ opacity: 0.3 }}>──────────────────────────────────────────────</div>
    {children}
  </div>
)

const AddressStatus = ({ stats }: { stats: AddressStats }) => {
  if (stats.type === 'wallet') {
    const s = stats.data
    return (
      <div style={containerStyle}>
        {section('📊 Wallet Snapshot', <>
          <div><strong>Wallet Age:</strong> <span style={{ opacity: 0.7 }}>{s.walletAge} day</span></div>
          <div><strong>Active Days:</strong> <span style={{ opacity: 0.7 }}>{s.activeDays}</span></div>
        </>)}

        {section('📈 Activity', <>
          <div><strong>Tx Count:</strong> <span style={{ opacity: 0.7 }}>{s.txCount}</span></div>
          <div><strong>Current Streak:</strong> <span style={{ opacity: 0.7 }}>{s.currentStreak} day</span></div>
          <div><strong>Best Streak:</strong> <span style={{ opacity: 0.7 }}>{s.bestStreak} day</span></div>
          <div><strong>Contracts Interacted:</strong> <span style={{ opacity: 0.7 }}>{s.contracts}</span></div>
        </>)}

        {section('🎯 Tokens & Fees', <>
          <div><strong>Tokens Received:</strong> <span style={{ opacity: 0.7 }}>{s.tokens}</span></div>
          <div><strong>Fees Paid (ETH):</strong> <span style={{ opacity: 0.7 }}>{s.feesEth}</span></div>
          <div><strong>Volume Sent (ETH):</strong> <span style={{ opacity: 0.7 }}>{s.volumeEth}</span></div>
          <div><strong>Wallet Balance (ETH):</strong> <span style={{ opacity: 0.7 }}>{s.balanceEth}</span></div>
        </>)}
      </div>
    )
  }

  if (stats.type === 'contract') {
    const s = stats.data
    return (
      <div style={containerStyle}>
        {section('📊 Contract Snapshot', <>
          <div><strong>Age:</strong> <span style={{ opacity: 0.7 }}>{s.age} day</span></div>
          <div><strong>First Seen:</strong> <span style={{ opacity: 0.7 }}>{s.firstSeen}</span></div>
          <div><strong>ETH Balance:</strong> <span style={{ opacity: 0.7 }}>{s.balanceEth}</span></div>
        </>)}

        {section('📈 Activity', <>
          <div><strong>Internal Tx Count:</strong> <span style={{ opacity: 0.7 }}>{s.internalTxCount}</span></div>
          <div><strong>Active Days:</strong> <span style={{ opacity: 0.7 }}>{s.activeDays}</span></div>
          <div><strong>Current Streak:</strong> <span style={{ opacity: 0.7 }}>{s.currentStreak} day</span></div>
          <div><strong>Best Streak:</strong> <span style={{ opacity: 0.7 }}>{s.bestStreak} day</span></div>
          <div><strong>Unique Senders:</strong> <span style={{ opacity: 0.7 }}>{s.uniqueSenders}</span></div>
          <div><strong>Zero ETH Internal Tx:</strong> <span style={{ opacity: 0.7 }}>{s.zeroEthTx}</span></div>
          <div><strong>ETH Received:</strong> <span style={{ opacity: 0.7 }}>{s.volumeEth}</span></div>
        </>)}

        {section('🎯 Tokens', <>
          <div><strong>Tokens Received:</strong> <span style={{ opacity: 0.7 }}>{s.tokensReceived}</span></div>
          <div><strong>Rare Tokens:</strong> <span style={{ opacity: 0.7 }}>{s.rareTokens}</span></div>
          <div><strong>Post Tokens (MiniApps/Frames):</strong> <span style={{ opacity: 0.7 }}>{s.postTokens}</span></div>
        </>)}

        {section('🧠 AA Metrics', <>
          <div><strong>All AA Transactions:</strong> <span style={{ opacity: 0.7 }}>{s.allAaTransactions}</span></div>
          <div><strong>AA Paymaster Success:</strong> <span style={{ opacity: 0.7 }}>{s.aaPaymasterSuccess}</span></div>
        </>)}
      </div>
    )
  }

  return null
}

export default AddressStatus
