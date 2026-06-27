// @ts-nocheck

import { x402VercelHandler } from "@x402/vercel";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { BUILDER_CODE, declareBuilderCodeExtension } from "@x402/extensions/builder-code";

export default x402VercelHandler(
  {
    "POST /ping": {
      accepts: [
        {
          scheme: "exact",
          price: "$0.001",
          network: "eip155:8453",
          payTo: "0xb46043d161bde18ef6974217a686f381b1e91138"
        }
      ],
      description: "BaseState activity submission",
      mimeType: "application/json",
      extensions: {
        [BUILDER_CODE]: declareBuilderCodeExtension("bc_laxhuqog")
      }
    }
  },
  {
    "eip155:8453": new ExactEvmScheme()
  },
  async (req, res) => {
    res.json({ ok: true });
  }
);
