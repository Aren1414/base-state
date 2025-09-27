import { parseEther } from 'viem'
import abi from './abi/BaseStateCard.json'

const CONTRACT_ADDRESS = '0x972f0F6D9f1C25eC153729113048Cdfe6828515c'

export async function mintCard(walletClient: any, wallet: `0x${string}`, tokenURI: string) {
  if (!walletClient || !wallet) throw new Error('Wallet client or address missing')

  const tx = await walletClient.writeContract({
    address: CONTRACT_ADDRESS,
    abi,
    functionName: 'mint',
    args: [tokenURI],
    account: wallet,
    value: parseEther('0.0001'),
  })

  console.log('Mint tx sent:', tx)
  return tx
}
