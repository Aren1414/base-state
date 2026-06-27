// @ts-nocheck

import { x402Client, wrapFetchWithPayment } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { HTTPFacilitatorClient } from "@x402/core/client";
import { facilitator } from "@coinbase/x402";
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
    sendTransaction: async (tx: any) => walletClient.sendTransaction(tx),
    signTypedData: async (params: any) => walletClient.signTypedData(params),
  };

  // MAINNET facilitator (CDP)
  const facilitatorClient = new HTTPFacilitatorClient(facilitator);

  const client = new x402Client(facilitatorClient);

  // Base MAINNET
  client.register("eip155:8453", new ExactEvmScheme(signer));

  // Builder Code
  client.registerExtension(new BuilderCodeClientExtension(BUILDER_CODE));

  // Wrap fetch with payment
  fetchWithPaymentSingleton = wrapFetchWithPayment(fetch, client);
}

export function getX402() {
  if (!fetchWithPaymentSingleton) {
    throw new Error("x402 not initialized");
  }
  return { fetchWithPayment: fetchWithPaymentSingleton };
}
