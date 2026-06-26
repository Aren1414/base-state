import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
  const { address } = await req.json();
  return NextResponse.json({ ok: true });
}
