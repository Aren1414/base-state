import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { address } = await req.json()

    if (!address) {
      return NextResponse.json({ error: 'Missing address' }, { status: 400 })
    }

    const apiKey = process.env.BASE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Missing API key' }, { status: 500 })
    }

    const url = `https://api.basescan.org/api?module=account&action=txlist&address=${address}&sort=asc&apikey=${apiKey}`

    const res = await fetch(url)
    const json = await res.json()

    return NextResponse.json(json)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
