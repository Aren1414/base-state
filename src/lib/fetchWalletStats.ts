export interface WalletStats {
  walletAge: number;
  activeDays: number;
  txCount: number;
  currentStreak: number;
  bestStreak: number;
  contracts: number;
  tokens: number;
  feesEth: string;
  volumeEth: string;
  balanceEth: string;
}

export interface ContractStats {
  age: number;
  firstSeen: string;
  balanceEth: string;
  internalTxCount: number;
  activeDays: number;
  currentStreak: number;
  bestStreak: number;
  uniqueSenders: number;
  zeroEthTx: number;
  volumeEth: string;
  tokensReceived: number;
  rareTokens: number;
  postTokens: number;
}

export type AddressStats =
  | { type: 'wallet'; data: WalletStats }
  | { type: 'contract'; data: ContractStats };

interface EtherscanTx {
  timeStamp: string;
  to: string;
  gasUsed: string;
  gasPrice: string;
  value: string;
  contractAddress?: string;
  tokenName?: string;
}

interface EtherscanResponse<T> {
  status: string;
  message: string;
  result: T;
}

export async function fetchWalletStats(address: string, apiKey: string): Promise<AddressStats> {
  const baseUrl = 'https://api.etherscan.io/v2/api';
  const chainId = 8453;

  const codeRes = await fetch(
    `${baseUrl}?chainid=${chainId}&module=contract&action=getsourcecode&address=${address}&apikey=${apiKey}`
  );
  const codeJson = await codeRes.json();
  const isContract = codeJson.result?.[0]?.ABI !== 'Contract source code not verified';

  if (!isContract) {
    // Wallet logic
    const txRes = await fetch(
      `${baseUrl}?chainid=${chainId}&module=account&action=txlist&address=${address}&sort=asc&apikey=${apiKey}`
    );
    const txJson: EtherscanResponse<EtherscanTx[]> = await txRes.json();
    const txList = txJson.result || [];

    const txCount = txList.length;
    const firstTs = parseInt(txList[0]?.timeStamp || '0', 10);
    const today = Math.floor(Date.now() / 1000);
    const walletAge = Math.floor((today - firstTs) / 86400);

    const activeDates = [...new Set(
      txList.map(tx => new Date(parseInt(tx.timeStamp, 10) * 1000).toISOString().slice(0, 10))
    )].sort();

    const activeDays = activeDates.length;

    let streak = 0, best = 0, prev = '';
    for (const date of activeDates) {
      if (!prev) {
        streak = 1;
      } else {
        const next = new Date(new Date(prev).getTime() + 86400000).toISOString().slice(0, 10);
        if (date === next) {
          streak++;
        } else {
          best = Math.max(best, streak);
          streak = 1;
        }
      }
      prev = date;
    }
    best = Math.max(best, streak);

    const contracts = [...new Set(txList.map(tx => tx.to))].length;
    const fees = txList.reduce((sum, tx) => sum + BigInt(tx.gasUsed) * BigInt(tx.gasPrice), 0n);
    const feesEth = (Number(fees) / 1e18).toFixed(6);

    const volume = txList.reduce((sum, tx) => sum + BigInt(tx.value), 0n);
    const volumeEth = (Number(volume) / 1e18).toFixed(6);

    const balRes = await fetch(
      `${baseUrl}?chainid=${chainId}&module=account&action=balance&address=${address}&apikey=${apiKey}`
    );
    const balanceJson: EtherscanResponse<string> = await balRes.json();
    const balanceEth = (Number(balanceJson.result) / 1e18).toFixed(6);

    const tokenRes = await fetch(
      `${baseUrl}?chainid=${chainId}&module=account&action=tokentx&address=${address}&apikey=${apiKey}`
    );
    const tokensJson: EtherscanResponse<EtherscanTx[]> = await tokenRes.json();
    const tokenCount = [...new Set(tokensJson.result.map(t => t.contractAddress))].length;

    return {
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
      },
    };
  }

  // Contract logic
  const intRes = await fetch(
    `${baseUrl}?chainid=${chainId}&module=account&action=txlistinternal&address=${address}&sort=asc&apikey=${apiKey}`
  );
  const intJson: EtherscanResponse<EtherscanTx[]> = await intRes.json();
  const intList = intJson.result || [];

  const internalTxCount = intList.length;
  const firstTs = parseInt(intList[0]?.timeStamp || '0', 10);
  const today = Math.floor(Date.now() / 1000);
  const age = Math.floor((today - firstTs) / 86400);
  const firstSeen = new Date(firstTs * 1000).toISOString().slice(0, 10);

  const activeDates = [...new Set(
    intList.map(tx => new Date(parseInt(tx.timeStamp, 10) * 1000).toISOString().slice(0, 10))
  )].sort();

  const activeDays = activeDates.length;

  let streak = 0, best = 0, prev = '';
  for (const date of activeDates) {
    if (!prev) {
      streak = 1;
    } else {
      const next = new Date(new Date(prev).getTime() + 86400000).toISOString().slice(0, 10);
      if (date === next) {
        streak++;
      } else {
        best = Math.max(best, streak);
        streak = 1;
      }
    }
    prev = date;
  }
  best = Math.max(best, streak);

  const uniqueSenders = [...new Set(intList.map(tx => tx.to))].length;
  const zeroEthTx = intList.filter(tx => tx.value === '0').length;
  const volume = intList.reduce((sum, tx) => sum + BigInt(tx.value), 0n);
  const volumeEth = (Number(volume) / 1e18).toFixed(6);

  const balRes = await fetch(
    `${baseUrl}?chainid=${chainId}&module=account&action=balance&address=${address}&apikey=${apiKey}`
  );
  const balanceJson: EtherscanResponse<string> = await balRes.json();
  const balanceEth = (Number(balanceJson.result) / 1e18).toFixed(6);

  const tokenRes = await fetch(
    `${baseUrl}?chainid=${chainId}&module=account&action=tokentx&address=${address}&apikey=${apiKey}`
  );
  const tokensJson: EtherscanResponse<EtherscanTx[]> = await tokenRes.json();
  const tokenList = tokensJson.result || [];
  const tokensReceived = [...new Set(tokenList.map(t => t.contractAddress))].length;
  const rareTokens = Object.values(tokenList.reduce((acc, t) => {
    acc[t.contractAddress] = (acc[t.contractAddress] || 0) + 1;
    return acc;
  }, {})).filter(c => c === 1).length;
  const postTokens = tokenList.filter(t =>
    /http|base\.dev|mini-app|frame/i.test(t.tokenName || '')
  ).length;

  return {
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
    },
  };
}
