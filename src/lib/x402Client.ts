import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { BuilderCodeClientExtension } from "@x402/extensions/builder-code";
import type { WalletClient } from "viem";

const BUILDER_CODE = "bc_laxhuqog";

let client: x402Client | null = null;
let fetchWithPayment: any = null;

export function initX402Client(walletClient: WalletClient) {
  if (client) return { client, fetchWithPayment };

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

  const c = new x402Client();

  c.register("eip155:8453", new ExactEvmScheme(signer));
  c.registerExtension(new BuilderCodeClientExtension(BUILDER_CODE));

  client = c;
  fetchWithPayment = wrapFetchWithPayment(fetch, client);

  return { client, fetchWithPayment };
}

export function getX402() {
  if (!client || !fetchWithPayment) {
    throw new Error("x402 not initialized");
  }
  return { client, fetchWithPayment };
}
