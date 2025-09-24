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

interface EtherscanTx {
  timeStamp: string;
  to: string;
  gasUsed: string;
  gasPrice: string;
  value: string;
  contractAddress?: string;
}

interface EtherscanResponse<T> {
  status: string;
  message: string;
  result: T;
}

export async function fetchWalletStats(address: string, apiKey: string): Promise<WalletStats> {
  const baseUrl = 'https://api.etherscan.io/v2/api';
  const chainId = 8453;

  const txRes = await fetch(
    `${baseUrl}?chainid=${chainId}&module=account&action=txlist&address=${address}&sort=asc&apikey=${apiKey}`
  );
  const txsJson: EtherscanResponse<EtherscanTx[]> = await txRes.json();
  const txList = txsJson.result || [];

  const txCount = txList.length;
  const firstTxTs = parseInt(txList[0]?.timeStamp || '0', 10);
  const today = Math.floor(Date.now() / 1000);
  const walletAge = Math.floor((today - firstTxTs) / 86400);

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
  };
}
