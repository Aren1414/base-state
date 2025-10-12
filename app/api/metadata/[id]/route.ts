import { NextRequest } from "next/server"

const PUBLIC_GATEWAY = "https://link.storjshare.io/raw"
const BUCKET = "wallet-cards" 
const STORJSHAREID = "jwehpt5oybcnyzdpzgkvbodeireq" 

export async function GET(request: NextRequest) {
  try {
    const urlSegments = request.nextUrl.pathname.split("/")
    const fileName = urlSegments[urlSegments.length - 1]

    const imageUrl = `${PUBLIC_GATEWAY}/${STORJSHAREID}/${BUCKET}/${fileName}`

    const metadata = {
      name: `BaseStateCard ${fileName.replace(".png", "")}`,
      description: "BaseState wallet/contract stats as NFT",
      image: imageUrl,
    }

    return new Response(JSON.stringify(metadata), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: unknown) {
    return new Response(
      JSON.stringify({ error: "Metadata generation failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
