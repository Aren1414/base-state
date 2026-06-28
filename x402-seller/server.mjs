import express from "express";
import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const app = express();

const payTo = "0xb46043d161bde18ef6974217a686f381b1e91138";

const facilitatorClient = new HTTPFacilitatorClient({
  url: "https://x402.org/facilitator"
});

const server = new x402ResourceServer(facilitatorClient)
  .register("eip155:84532", new ExactEvmScheme());

app.use(
  paymentMiddleware(
    {
      "POST /ping": {
        accepts: [
          {
            scheme: "exact",
            price: "$0.001",
            network: "eip155:84532",
            payTo
          }
        ],
        description: "ping",
        mimeType: "application/json"
      }
    },
    server
  )
);

app.post("/ping", (req, res) => {
  res.json({ ok: true });
});

app.listen(4021, () => {});
