import { createWalletClient, custom, parseEther } from 'viem'
import { base } from 'viem/chains'
import abi from './abi/BaseStateCard.json'

const CONTRACT_ADDRESS = '0x972f0F6D9f1C25eC153729113048Cdfe6828515c'

export async function mintCard(wallet: `0x${string}`, tokenURI: string) {
  let signer

  if (typeof window !== 'undefined' && window.ethereum) {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    if (!accounts || accounts.length === 0) throw new Error('No accounts found')

    signer = createWalletClient({
      chain: base,
      transport: custom(window.ethereum),
    })

    const tx = await signer.writeContract({
      address: CONTRACT_ADDRESS,
      abi,
      functionName: 'mint',
      args: [tokenURI],
      account: accounts[0],
      value: parseEther('0.0001'),
    })

    console.log('Mint tx sent:', tx)
    return tx
  } else {
    throw new Error('No wallet provider found')
  }
}
