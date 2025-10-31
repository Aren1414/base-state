import {
  parseWebhookEvent,
  verifyAppKeyWithNeynar,
} from "@farcaster/miniapp-node";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const requestJson = await request.json();

  let data;
  try {
    
    data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar);
  } catch (e) {
    console.error("❌ Webhook verification failed:", e);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  const { fid, appFid, event } = data;

  
  const response = NextResponse.json({ ok: true });
  (async () => {
    try {
      switch (event.event) {
        case "miniapp_added":
          console.log("✅ MiniApp added:", { fid, appFid });
          break;

        case "miniapp_removed":
          console.log("❎ MiniApp removed:", { fid, appFid });
          break;

        case "notifications_enabled":
          console.log("🔔 Notifications enabled:", event.notificationDetails);
          break;

        case "notifications_disabled":
          console.log("🔕 Notifications disabled:", { fid, appFid });
          break;

        default:
          console.log("ℹ️ Unhandled event:", event.event);
      }
    } catch (err) {
      console.error("⚠️ Webhook handler error:", err);
    }
  })();

  return response;
}
