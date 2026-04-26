import { NextResponse } from 'next/server'

interface BlockscoutTx {
  timeStamp: string;
  to: string;
  gasUsed: string;
  gasPrice: string;
  value: string;
  contractAddress?: string;
  tokenName?: string;
}

interface BlockscoutResponse<T> {
  status: string;
  message: string;
  result: T;
}

export async function POST(req: Request) {
  try {
    const { address } = await req.json()

    if (!address) {
      return NextResponse.json({ error: 'Missing address' }, { status: 400 })
    }

    const apiKey = process.env.BLOCKSCOUT_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
    }

    // -------------------------
    // Blockscout PRO API
    // -------------------------
    const baseUrl = 'https://api.blockscout.com/v2/api'
    const chainId = 8453

    // -------------------------
    // 1) CHECK IF CONTRACT
    // -------------------------
    const codeRes = await fetch(
      `${baseUrl}?chain_id=${chainId}&module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`
    )
    const codeJson = await codeRes.json()
    const isContract = codeJson.result?.[0]?.ABI !== 'Contract source code not verified'

    // -------------------------
    // WALLET MODE
    // -------------------------
    if (!isContract) {
      const txRes = await fetch(
        `${baseUrl}?chain_id=${chainId}&module=account&action=txlist&address=${address}&sort=asc&apikey=${apiKey}`
      )
      const txJson: BlockscoutResponse<BlockscoutTx[]> = await txRes.json()
      const txList: BlockscoutTx[] = txJson.result || []

      const txCount = txList.length
      const firstTs = parseInt(txList[0]?.timeStamp || '0', 10)
      const today = Math.floor(Date.now() / 1000)
      const walletAge = firstTs > 0 ? Math.floor((today - firstTs) / 86400) : 0

      const activeDates = [...new Set(
        txList.map((tx: BlockscoutTx) =>
          new Date(parseInt(tx.timeStamp, 10) * 1000).toISOString().slice(0, 10)
        )
      )].sort()

      const activeDays = activeDates.length

      let streak = 0, best = 0, prev = ''
      for (const date of activeDates) {
        if (!prev) streak = 1
        else {
          const next = new Date(new Date(prev).getTime() + 86400000).toISOString().slice(0, 10)
          if (date === next) streak++
          else {
            best = Math.max(best, streak)
            streak = 1
          }
        }
        prev = date
      }
      best = Math.max(best, streak)

      const contracts = [...new Set(txList.map(tx => tx.to))].length
      const fees = txList.reduce(
        (sum, tx) => sum + BigInt(tx.gasUsed || '0') * BigInt(tx.gasPrice || '0'),
        0n
      )
      const feesEth = (Number(fees) / 1e18).toFixed(6)

      const volume = txList.reduce(
        (sum, tx) => sum + BigInt(tx.value || '0'),
        0n
      )
      const volumeEth = (Number(volume) / 1e18).toFixed(6)

      const balRes = await fetch(
        `${baseUrl}?chain_id=${chainId}&module=account&action=balance&address=${address}&apikey=${apiKey}`
      )
      const balanceJson: BlockscoutResponse<string> = await balRes.json()
      const balanceEth = (Number(balanceJson.result || '0') / 1e18).toFixed(6)

      const tokenRes = await fetch(
        `${baseUrl}?chain_id=${chainId}&module=account&action=tokentx&address=${address}&apikey=${apiKey}`
      )
      const tokensJson: BlockscoutResponse<BlockscoutTx[]> = await tokenRes.json()
      const tokenCount = [...new Set(
        (tokensJson.result || [])
          .map(t => t.contractAddress)
          .filter(Boolean)
      )].length

      return NextResponse.json({
        type: 'wallet',
        data: {
          walletAge,
          activeDays,
          txCount,
          currentStreak: streak,
          bestStreak: best,
          contracts,
          tokens: tokenCount,
          feesEth,
          volumeEth,
          balanceEth,
        }
      })
    }

    // -------------------------
    // CONTRACT MODE
    // -------------------------
    const intRes = await fetch(
      `${baseUrl}?chain_id=${chainId}&module=account&action=txlistinternal&address=${address}&sort=asc&apikey=${apiKey}`
    )
    const intJson: BlockscoutResponse<BlockscoutTx[]> = await intRes.json()
    const intList: BlockscoutTx[] = intJson.result || []

    const internalTxCount = intList.length
    const firstTs = parseInt(intList[0]?.timeStamp || '0', 10)
    const today = Math.floor(Date.now() / 1000)
    const age = firstTs > 0 ? Math.floor((today - firstTs) / 86400) : 0
    const firstSeen = firstTs > 0
      ? new Date(firstTs * 1000).toISOString().slice(0, 10)
      : ''

    const activeDates = [...new Set(
      intList.map((tx: BlockscoutTx) =>
        new Date(parseInt(tx.timeStamp, 10) * 1000).toISOString().slice(0, 10)
      )
    )].sort()

    const activeDays = activeDates.length

    let streak = 0, best = 0, prev = ''
    for (const date of activeDates) {
      if (!prev) streak = 1
      else {
        const next = new Date(new Date(prev).getTime() + 86400000).toISOString().slice(0, 10)
        if (date === next) streak++
        else {
          best = Math.max(best, streak)
          streak = 1
        }
      }
      prev = date
    }
    best = Math.max(best, streak)

    const uniqueSenders = [...new Set(intList.map(tx => tx.to))].length
    const zeroEthTx = intList.filter(tx => tx.value === '0').length
    const volume = intList.reduce((sum, tx) => sum + BigInt(tx.value || '0'), 0n)
    const volumeEth = (Number(volume) / 1e18).toFixed(6)

    const balRes = await fetch(
      `${baseUrl}?chain_id=${chainId}&module=account&action=balance&address=${address}&apikey=${apiKey}`
    )
    const balanceJson: BlockscoutResponse<string> = await balRes.json()
    const balanceEth = (Number(balanceJson.result || '0') / 1e18).toFixed(6)

    const tokenRes = await fetch(
      `${baseUrl}?chain_id=${chainId}&module=account&action=tokentx&address=${address}&apikey=${apiKey}`
    )
    const tokensJson: BlockscoutResponse<BlockscoutTx[]> = await tokenRes.json()
    const tokenList = tokensJson.result || []

    const tokensReceived = [...new Set(
      tokenList.map(t => t.contractAddress).filter(Boolean)
    )].length

    const rareTokens = Object.values(
      tokenList.reduce((acc: Record<string, number>, t) => {
        if (t.contractAddress) {
          acc[t.contractAddress] = (acc[t.contractAddress] || 0) + 1
        }
        return acc
      }, {})
    ).filter(c => c === 1).length

    const postTokens = tokenList.filter(t =>
      /http|base\.dev|mini-app|frame/i.test(t.tokenName || '')
    ).length

    // ---------- AA metrics ----------
    const padded = `0x${address.toLowerCase().replace(/^0x/, '').padStart(64, '0')}`
    const topic0 =
      '0x49628fd1471006c1482da88028e9ce4dbb080b815c9b0344d39e5a8e6ec1419f'
    const entryPoint = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'

    const aaRes = await fetch(
      `${baseUrl}?chain_id=${chainId}` +
      `&module=logs&action=getLogs` +
      `&fromBlock=0&toBlock=latest` +
      `&address=${entryPoint}` +
      `&topic0=${topic0}` +
      `&topic2=${padded}` +
      `&apikey=${apiKey}`
    )
    const aaJson: BlockscoutResponse<any[]> = await aaRes.json()
    const aaList = aaJson.result || []

    const allAaTransactions = aaList.length
    const aaPaymasterSuccess = aaList.filter(log =>
      log.data?.slice(66, 130) ===
        '0000000000000000000000000000000000000000000000000000000000000001' &&
      log.topics?.[3] !==
        '0x0000000000000000000000000000000000000000000000000000000000000000'
    ).length

    return NextResponse.json({
      type: 'contract',
      data: {
        age,
        firstSeen,
        balanceEth,
        internalTxCount,
        activeDays,
        currentStreak: streak,
        bestStreak: best,
        uniqueSenders,
        zeroEthTx,
        volumeEth,
        tokensReceived,
        rareTokens,
        postTokens,
        allAaTransactions,
        aaPaymasterSuccess,
      }
    })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
