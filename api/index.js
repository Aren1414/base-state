import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";
import { facilitator } from "@coinbase/x402";
import { BUILDER_CODE, declareBuilderCodeExtension } from "@x402/extensions/builder-code";

const app = express();
app.use(express.json());


const payTo = "0xb46043d161bde18ef6974217a686f381b1e91138";


const facilitatorClient = new HTTPFacilitatorClient(facilitator);


const server = new x402ResourceServer(facilitatorClient)
  .register("eip155:8453", new ExactEvmScheme());

app.use(
  paymentMiddleware(
    {
      "POST /ping": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.001",
            network: "eip155:8453",
            payTo,
          },
        ],
        description: "BaseState activity submission",
        mimeType: "application/json",
        extensions: {
          [BUILDER_CODE]: declareBuilderCodeExtension("bc_laxhuqog"),
        },
      },
    },
    server
  )
);

app.post("/ping", (req, res) => {
  res.json({ ok: true });
});

export default app;
