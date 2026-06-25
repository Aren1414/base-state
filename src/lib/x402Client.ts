import { x402Client } from "@x402/fetch";
import { ExactEvmScheme } from "@x402/evm/exact/client";
import { BuilderCodeClientExtension } from "@x402/extensions/builder-code";
import type { WalletClient } from "viem";

const BUILDER_CODE = "bc_laxhuqog";

let client: x402Client | null = null;

export function initX402Client(walletClient: WalletClient) {
  if (client) return client;

  const c = new x402Client();

  c.register("eip155:8453", new ExactEvmScheme(walletClient));

  c.registerExtension(new BuilderCodeClientExtension(BUILDER_CODE));

  client = c;
  return client;
}

export function getX402Client() {
  if (!client) throw new Error("x402 client not initialized");
  return client;
}
