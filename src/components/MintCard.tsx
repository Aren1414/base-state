import React, { useState } from "react"
import { uploadCanvas } from "../lib/uploadCanvas"
import { useAccount, useWalletClient } from "wagmi"
import { parseEther } from "viem"
import abi from "../lib/abi/BaseStateCard.json"

const CONTRACT_ADDRESS = "0x972f0F6D9f1C25eC153729113048Cdfe6828515c"

interface MintCardProps {
  stats: any
  type: "wallet" | "contract"
  user: {
    fid: number
    username?: string
    pfpUrl?: string
  }
  minted: boolean
  setMintedImageUrl: (url: string) => void
}

export default function MintCard({
  stats,
  type,
  user,
  minted,
  setMintedImageUrl,
}: MintCardProps) {
  const { address: walletAddress } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [mintStatus, setMintStatus] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [isMinting, setIsMinting] = useState(false)

  const handleMint = async () => {
    if (!walletClient || !walletAddress) {
      setMintStatus("❌ Wallet not connected")
      return
    }

    setMintStatus("🧪 Minting…")
    setIsMinting(true)

    try {
      const card = document.getElementById("walletCard")
      if (!card) throw new Error("Card not found in DOM")

      const html2canvas = (await import("html2canvas")).default
      const canvas = await html2canvas(card, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })

      const uploadedLink = await uploadCanvas(canvas, setMintStatus)
      setDownloadUrl(uploadedLink)
      setMintedImageUrl(uploadedLink)

      await walletClient.writeContract({
        address: CONTRACT_ADDRESS,
        abi,
        functionName: "mint",
        args: [uploadedLink],
        account: walletAddress,
        value: parseEther("0.0001"),
      })

      setMintStatus("✅ Mint successful!")
    } catch (err: any) {
      const message = typeof err === "string" ? err : err?.message || "Unknown error"
      setMintStatus(`❌ Mint failed: ${message}`)
    } finally {
      setIsMinting(false)
    }
  }

  const handleShareCard = () => {
    if (!downloadUrl) return
    const fileName = downloadUrl.split("/").pop()?.replace(".png", "") || "card"
    const embedPreview = `${window.location.origin}/share/${fileName}`

    const warpcastUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(
      "📸 Just minted my BaseState NFT card!"
    )}&embeds[]=${encodeURIComponent(embedPreview)}`

    window.open(warpcastUrl, "_blank")
  }

  return (
    <div style={{ marginTop: "16px", padding: "8px", boxSizing: "border-box" }}>
      <div
        id="walletCard"
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "linear-gradient(135deg, #00f0ff, #7f00ff)",
          borderRadius: "16px",
          padding: "16px",
          color: "#fff",
          boxShadow: "0 0 20px rgba(0,255,255,0.25)",
          display: "grid",
          gridTemplateColumns: "90px 1fr",
          gap: "12px",
          position: "relative",
          margin: "0 auto 16px auto",
          fontFamily: "'Segoe UI', sans-serif",
          boxSizing: "border-box",
          minHeight: "200px",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <img
            src={user.pfpUrl || "/default-avatar.png"}
            alt="pfp"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              border: "2px solid #fff",
              boxShadow: "0 0 4px #00f",
              objectFit: "cover",
              marginBottom: "6px",
            }}
          />
          <div
  style={{
    maxWidth: "120px",
    fontWeight: 700,
    fontSize: user.username && user.username.length > 12 ? "12px" : "14px",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    lineHeight: "32px",
    height: "32px",
    paddingBottom: "2px",
    display: "block",
    WebkitFontSmoothing: "antialiased",
    MozOsxFontSmoothing: "grayscale",
  }}
>
  @{user.username || "user"}
</div>
          <div style={{ fontSize: "11px", color: "#ccc", marginTop: "2px" }}>FID: {user.fid}</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
          <div
            style={{
              fontSize: type === "contract" ? "13px" : "14px",
              fontWeight: 800,
              marginBottom: "8px",
            }}
          >
            BaseState {type === "wallet" ? "Wallet" : "BaseApp Wallet Snapshot"}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "8px",
              fontSize: "11px",
              lineHeight: 1.3,
            }}
          >
            {(type === "wallet"
              ? [
                  { label: "Wallet Age", value: stats.walletAge + " days" },
                  { label: "Active Days", value: stats.activeDays },
                  { label: "Tx Count", value: stats.txCount },
                  { label: "Best Streak", value: stats.bestStreak + " days" },
                  { label: "Contracts", value: stats.contracts },
                  { label: "Tokens Received", value: stats.tokens },
                  { label: "Volume Sent (ETH)", value: stats.volumeEth },
                  { label: "Fees Paid (ETH)", value: stats.feesEth },
                ]
              : [
                  { label: "Age", value: stats.age + " days" },
                  { label: "Post", value: stats.postTokens },
                  { label: "Internal Tx Count", value: stats.internalTxCount },
                  { label: "Best Streak", value: stats.bestStreak + " days" },
                  { label: "Unique Senders", value: stats.uniqueSenders },
                  { label: "Tokens Received", value: stats.tokensReceived },
                  { label: "AA Transactions", value: stats.allAaTransactions },
                  { label: "Rare Tokens", value: stats.rareTokens },
                ]
            ).map((f, i) => (
              <div key={i}>
                <strong>{f.label}</strong>
                <br />
                {f.value}
              </div>
            ))}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "6px",
              left: "12px",
              fontSize: "10px",
              color: "#ccc",
            }}
          >
            Powered by BaseState
          </div>
        </div>
      </div>

      {mintStatus && (
        <div style={{ fontSize: "11px", color: "#ccc", marginTop: "8px", textAlign: "center" }}>
          {mintStatus}
        </div>
      )}

      <div
        style={{
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "8px",
          marginTop: "10px",
        }}
      >
        <button
          onClick={handleMint}
          style={buttonStyle("#00ff7f")}
          disabled={!walletClient || !walletAddress || isMinting}
        >
          🪙 Mint as NFT
        </button>

        <button
          onClick={() => downloadUrl && window.open(downloadUrl, "_blank")}
          style={buttonStyle("#7f00ff")}
          disabled={!downloadUrl}
        >
          📥 Download Card
        </button>

        <button
          onClick={handleShareCard}
          style={buttonStyle("#00f0ff")}
          disabled={!downloadUrl}
        >
          📸 Share Minted Card
        </button>
      </div>
    </div>
  )
}

function buttonStyle(color: string): React.CSSProperties {
  return {
    padding: "5px 12px",
    fontSize: "11px",
    background: "#fff",
    color,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    boxShadow: "0 0 2px rgba(0,0,0,0.1)",
    minWidth: "90px",
    fontWeight: 600,
    transition: "all 0.2s ease-in-out",
  }
}
