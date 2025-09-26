export type WalletStats = {
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

export type ContractStats = {
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
