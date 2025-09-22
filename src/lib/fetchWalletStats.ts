export async function fetchWalletStats(address: string, apiKey: string) {
  const baseUrl = 'https://api.etherscan.io/v2/api'
  const chainId = 8453

  const txRes = await fetch(`${baseUrl}?chainid=${chainId}&module=account&action=txlist&address=${address}&sort=asc&apikey=${apiKey}`)
  const txs = await txRes.json()
  const txList = txs.result || []

  const txCount = txList.length
  const firstTxTs = parseInt(txList[0]?.timeStamp || '0')
  const today = Math.floor(Date.now() / 1000)
  const walletAge = Math.floor((today - firstTxTs) / 86400)

  const activeDates = [...new Set(txList.map(tx => new Date(parseInt(tx.timeStamp) * 1000).toISOString().slice(0, 10)))]
  const activeDays = activeDates.length

  let streak = 0, best = 0, prev = ''
  for (const date of activeDates) {
    if (!prev) {
      streak = 1
    } else {
      const next = new Date(new Date(prev).getTime() + 86400000).toISOString().slice(0, 10)
      if (date === next) {
        streak++
      } else {
        best = Math.max(best, streak)
        streak = 1
      }
    }
    prev = date
  }
  best = Math.max(best, streak)

  const contracts = [...new Set(txList.map(tx => tx.to))].length
  const fees = txList.reduce((sum, tx) => sum + BigInt(tx.gasUsed) * BigInt(tx.gasPrice), 0n)
  const feesEth = (Number(fees) / 1e18).toFixed(6)

  const volume = txList.reduce((sum, tx) => sum + BigInt(tx.value), 0n)
  const volumeEth = (Number(volume) / 1e18).toFixed(6)

  const balRes = await fetch(`${baseUrl}?chainid=${chainId}&module=account&action=balance&address=${address}&apikey=${apiKey}`)
  const balance = await balRes.json()
  const balanceEth = (Number(balance.result) / 1e18).toFixed(6)

  const tokenRes = await fetch(`${baseUrl}?chainid=${chainId}&module=account&action=tokentx&address=${address}&apikey=${apiKey}`)
  const tokens = await tokenRes.json()
  const tokenCount = [...new Set(tokens.result.map((t: any) => t.contractAddress))].length

  return {
    walletAge,
    activeDays,
    txCount,
    currentStreak: streak,
    bestStreak: best,
    contracts,
    tokens: tokenCount,
    feesEth,
    volumeEth,
    balanceEth
  }
    }
