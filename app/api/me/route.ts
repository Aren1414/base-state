import { createClient, Errors } from "@farcaster/quick-auth";
import { NextRequest, NextResponse } from "next/server";

const client = createClient();

function getUrlHost(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      const url = new URL(origin);
      return url.host;
    } catch {}
  }
  return request.headers.get("host") || "localhost:3000";
}

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("Authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return NextResponse.json({ message: "Missing token" }, { status: 401 });
  }

  try {
    const payload = await client.verifyJwt({
      token: authorization.split(" ")[1],
      domain: getUrlHost(request),
    });

    return NextResponse.json({ fid: payload.sub });
  } catch (e) {
    if (e instanceof Errors.InvalidTokenError) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
