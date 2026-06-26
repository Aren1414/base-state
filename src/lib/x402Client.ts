import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { BuilderCodeClientExtension } from "@x402/extensions/builder-code";
import type { WalletClient } from "viem";

const BUILDER_CODE = "bc_laxhuqog";

let fetchWithPaymentSingleton: any = null;

export function initX402Client(walletClient: WalletClient) {
  if (fetchWithPaymentSingleton) return;

  if (!walletClient || !walletClient.account) {
    throw new Error("walletClient not ready");
  }

  
  const signer = {
    address: walletClient.account.address,
    sendTransaction: async (tx: any) => {
      return walletClient.sendTransaction(tx);
    },
    signTypedData: async (params: any) => {
      return walletClient.signTypedData(params);
    },
  };

  
  const client = new x402Client();

  
  client.register("eip155:*", new ExactEvmScheme(signer));

  
  client.registerExtension(new BuilderCodeClientExtension(BUILDER_CODE));

  
  fetchWithPaymentSingleton = wrapFetchWithPayment(fetch, client);
}

export function getX402() {
  if (!fetchWithPaymentSingleton) {
    throw new Error("x402 not initialized");
  }
  return { fetchWithPayment: fetchWithPaymentSingleton };
}
