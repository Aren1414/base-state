import { ImageResponse } from "next/server"

export const runtime = "edge"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const imageUrl = searchParams.get("src")

  if (!imageUrl) {
    return new Response("Missing image src", { status: 400 })
  }

  const res = await fetch(imageUrl)
  const blob = await res.blob()

  return new Response(blob, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, immutable, no-transform, max-age=300",
    },
  })
}
