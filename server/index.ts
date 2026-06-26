import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { BUILDER_CODE, declareBuilderCodeExtension } from "@x402/extensions/builder-code";

const app = express();
app.use(express.json());

const server = new x402ResourceServer().register(
  "eip155:8453",
  new ExactEvmScheme()
);

app.use(
  paymentMiddleware(
    {
      "POST /ping": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.02",
            network: "eip155:8453",
            payTo: "0xb46043d161bde18ef6974217a686f381b1e91138",
          },
        ],
        description: "2 cent payment",
        mimeType: "application/json",
        extensions: {
          [BUILDER_CODE]: declareBuilderCodeExtension("bc_laxhuqog"),
        },
      },
    },
    server
  )
);

app.post("/ping", (req: express.Request, res: express.Response) => {
  res.json({ ok: true });
});

app.listen(3001, () => {
  console.log("X402 server running on http://localhost:3001");
});
