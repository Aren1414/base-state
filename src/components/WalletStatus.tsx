'use client'
import React from 'react'

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

const WalletStatus = ({ stats }: { stats: WalletStats }) => {
  return (
    <div style={{ fontFamily: 'monospace', lineHeight: '1.8', padding: '1rem' }}>
      <div><strong>Wallet Age:</strong> <span style={{ opacity: 0.7 }}>{stats.walletAge} days</span></div>
      <div><strong>Active Days:</strong> <span style={{ opacity: 0.7 }}>{stats.activeDays}</span></div>
      <div><strong>Tx Count:</strong> <span style={{ opacity: 0.7 }}>{stats.txCount}</span></div>
      <div><strong>Streak:</strong> <span style={{ opacity: 0.7 }}>{stats.currentStreak}</span></div>
      <div><strong>Best Streak:</strong> <span style={{ opacity: 0.7 }}>{stats.bestStreak}</span></div>
      <div><strong>Contracts:</strong> <span style={{ opacity: 0.7 }}>{stats.contracts}</span></div>
      <div><strong>Tokens:</strong> <span style={{ opacity: 0.7 }}>{stats.tokens}</span></div>
      <div><strong>Fees (ETH):</strong> <span style={{ opacity: 0.7 }}>{stats.feesEth}</span></div>
      <div><strong>Volume (ETH):</strong> <span style={{ opacity: 0.7 }}>{stats.volumeEth}</span></div>
      <div><strong>Balance (ETH):</strong> <span style={{ opacity: 0.7 }}>{stats.balanceEth}</span></div>
    </div>
  )
}

export default WalletStatus
