import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { BUILDER_CODE, declareBuilderCodeExtension } from "@x402/extensions/builder-code";

const app = express();
app.use(express.json());

app.use(
  paymentMiddleware(
    {
      "POST /ping": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.001",
            network: "eip155:8453",
            payTo: "0xb46043d161bde18ef6974217a686f381b1e91138",
          },
        ],
        description: "BaseState activity submission",
        mimeType: "application/json",
        extensions: {
          [BUILDER_CODE]: declareBuilderCodeExtension("bc_laxhuqog"),
        },
      },
    },
    new x402ResourceServer().register("eip155:8453", new ExactEvmScheme())
  )
);

app.post("/ping", (req, res) => {
  res.json({ ok: true });
});

export default app;
