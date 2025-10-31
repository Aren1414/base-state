import { NextRequest, NextResponse } from "next/server";
import { parseWebhookEvent, verifyAppKeyWithNeynar } from "@farcaster/miniapp-node";

// Define types based on Base App documentation
type NotificationDetails = {
  url: string;
  token: string;
};

type BaseWebhookEvent =
  | { event: "miniapp_added"; notificationDetails?: NotificationDetails }
  | { event: "miniapp_removed" }
  | { event: "notifications_enabled"; notificationDetails: NotificationDetails }
  | { event: "notifications_disabled" };

type WebhookData = {
  fid: number;
  appFid: number;
  event: BaseWebhookEvent;
};

export async function POST(request: NextRequest) {
  const requestJson = await request.json();

  let data: WebhookData;
  try {
    // Parse and verify webhook event signature
    data = await parseWebhookEvent(requestJson, verifyAppKeyWithNeynar) as WebhookData;
  } catch (e) {
    console.error("❌ Webhook verification failed:", e);
    return NextResponse.json({ error: "Invalid webhook" }, { status: 400 });
  }

  const { fid, appFid, event } = data;

  // ✅ Respond immediately to Base app to avoid timeout
  const response = NextResponse.json({ ok: true });

  // ✅ Process events asynchronously after sending response
  (async () => {
    try {
      switch (event.event) {
        case "miniapp_added":
          console.log("✅ MiniApp added:", { fid, appFid, notificationDetails: event.notificationDetails });
          // Here you can save notificationDetails to DB if exists
          break;

        case "miniapp_removed":
          console.log("❎ MiniApp removed:", { fid, appFid });
          // Delete notificationDetails from DB if saved
          break;

        case "notifications_enabled":
          console.log("🔔 Notifications enabled:", event.notificationDetails);
          // Save new notificationDetails to DB and optionally send a confirmation notification
          break;

        case "notifications_disabled":
          console.log("🔕 Notifications disabled:", { fid, appFid });
          // Delete notificationDetails from DB
          break;

        default:
          console.log("ℹ️ Unhandled event:", (event as any).event);
      }
    } catch (err) {
      console.error("⚠️ Async webhook handler failed:", err);
    }
  })();

  return response;
}
