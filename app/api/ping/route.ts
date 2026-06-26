import { NextResponse } from 'next/server';
import { x402Server } from '@x402/server';

export const runtime = 'nodejs';


async function handler(req: Request) {
  const { address } = await req.json();

  if (!address) {
    return NextResponse.json({ ok: false, error: 'No address' }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}


export const POST = x402Server(handler, {
  chainId: 8453,        
  price: '0.00001',     
});
