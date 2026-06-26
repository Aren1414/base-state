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

  const client = new x402Client();

  // Register signer directly (walletClient IS the signer)
  client.register("eip155:*", new ExactEvmScheme(walletClient));

  // Register Builder Code
  client.registerExtension(new BuilderCodeClientExtension(BUILDER_CODE));

  // Wrap fetch
  fetchWithPaymentSingleton = wrapFetchWithPayment(fetch, client);
}

export function getX402() {
  if (!fetchWithPaymentSingleton) {
    throw new Error("x402 not initialized");
  }
  return { fetchWithPayment: fetchWithPaymentSingleton };
}
