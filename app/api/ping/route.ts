import { x402Middleware } from '@coinbase/onchainkit/x402'

export const runtime = 'edge'

export const POST = x402Middleware(
  async (req) => {
    const body = await req.json()
    return Response.json({ ok: true, address: body.address })
  },
  {
    price: '0.00001',
    chainId: 8453,
  }
)
