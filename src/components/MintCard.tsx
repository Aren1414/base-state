import React, { useState, useRef } from "react"
import { uploadCanvas } from "../lib/uploadCanvas"
import { useAccount, useWalletClient } from "wagmi"
import { parseEther } from "viem"
import abi from "../lib/abi/BaseStateCard.json"

const CONTRACT_ADDRESS = "0x972f0F6D9f1C25eC153729113048Cdfe6828515c"

export default function MintCard({ stats, type, user, setMintedImageUrl }) {
  const { address: walletAddress } = useAccount()
  const { data: walletClient } = useWalletClient()
  const [mintStatus, setMintStatus] = useState<string | null>(null)
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [isMinting, setIsMinting] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMint = async () => {
    if (!walletClient || !walletAddress) {
      setMintStatus("❌ Wallet not connected")
      return
    }

    setMintStatus("🧪 Minting…")
    setIsMinting(true)

    try {
      const card = cardRef.current
      if (!card) throw new Error("Card not found")

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
      const msg = err?.message || String(err)
      setMintStatus(`❌ Mint failed: ${msg}`)
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
    <div style={{ marginTop: 16, padding: 8, boxSizing: "border-box" }}>
      
      <div
        ref={cardRef}
        id="walletCard"
        style={{
          width: "100%",
          maxWidth: 380,
          background: "linear-gradient(135deg, #00f0ff, #7f00ff)",
          borderRadius: 16,
          padding: 16,
          color: "#fff",
          boxShadow: "0 0 20px rgba(0,255,255,0.25)",
          display: "grid",
          gridTemplateColumns: "90px 1fr",
          gap: 12,
          position: "relative",
          margin: "0 auto 16px auto",
          fontFamily: "'Segoe UI', sans-serif",
          boxSizing: "border-box",
          minHeight: 200,
        }}
      >
        {/* Avatar + username */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <img
            src={user.pfpUrl || "/default-avatar.png"}
            alt="pfp"
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "2px solid #fff",
              boxShadow: "0 0 4px #00f",
              objectFit: "cover",
              marginBottom: 6,
            }}
          />
          <div
            style={{
              maxWidth: 120,
              fontWeight: 700,
              fontSize: user.username?.length > 12 ? 12 : 14,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: "32px",
              height: "32px",
              paddingBottom: 2,
              display: "block",
              WebkitFontSmoothing: "antialiased",
              MozOsxFontSmoothing: "grayscale",
            }}
          >
            @{user.username || "user"}
          </div>
          <div style={{ fontSize: 11, color: "#ccc", marginTop: 2 }}>FID: {user.fid}</div>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
          <div
            style={{
              fontSize: type === "contract" ? 13 : 14,
              fontWeight: 800,
              marginBottom: 8,
            }}
          >
            BaseState {type === "wallet" ? "Wallet" : "BaseApp Wallet Snapshot"}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 8,
              fontSize: 11,
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
              bottom: 6,
              left: 12,
              fontSize: 10,
              color: "#ccc",
            }}
          >
            Powered by BaseState
          </div>
        </div>
      </div>

      {/* Status */}
      {mintStatus && (
        <div style={{ fontSize: 11, color: "#ccc", marginTop: 8, textAlign: "center" }}>
          {mintStatus}
        </div>
      )}

      {/* Buttons */}
      <div
        style={{
          textAlign: "center",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 10,
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
    fontSize: 11,
    background: "#fff",
    color,
    border: "none",
    borderRadius: 6,
    cursor: "pointer",
    boxShadow: "0 0 2px rgba(0,0,0,0.1)",
    minWidth: 90,
    fontWeight: 600,
    transition: "all 0.2s ease-in-out",
  }
  }
