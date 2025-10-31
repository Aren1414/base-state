import { parseWebhookEvent, verifyAppKeyWithNeynar } from "@farcaster/miniapp-node";

export async function POST(request) {
  const body = await request.json();
  let data;

  try {
    data = await parseWebhookEvent(body, verifyAppKeyWithNeynar);
  } catch (err) {
    console.error("❌ Webhook verify failed:", err);
    return new Response("invalid", { status: 400 });
  }

  const { event, fid, appFid } = data;

  
  const response = new Response("ok", { status: 200 });

  
  (async () => {
    try {
      switch (event.event) {
        case "miniapp_added":
          console.log("✅ MiniApp added:", { fid, appFid, event });
          break;

        case "miniapp_removed":
          console.log("❎ MiniApp removed:", { fid, appFid });
          break;

        case "notifications_enabled":
          console.log("🔔 Notifications enabled:", event.notificationDetails);
          break;

        case "notifications_disabled":
          console.log("🔕 Notifications disabled for:", { fid, appFid });
          break;

        default:
          console.log("ℹ️ Unhandled event:", event.event);
      }
    } catch (err) {
      console.error("⚠️ Async webhook handler failed:", err);
    }
  })();

  return response;
}
