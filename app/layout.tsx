import { Inter, Source_Code_Pro } from "next/font/google";
import { RootProvider } from "./rootProvider";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import FrameReady from "./components/FrameReady";
import WalletCheck from "./components/WalletCheck";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const sourceCodePro = Source_Code_Pro({ variable: "--font-source-code-pro", subsets: ["latin"] });

export const metadata = {
  title: "BaseState Mini App",
  description: "Mint your blockchain identity as an NFT card",
  other: {
    "fc:frame": JSON.stringify({
      version: "1",
      imageUrl: "https://base-state.vercel.app/embed.png",
      button: {
        title: "Launch Mini App",
        action: {
          type: "launch_frame",
          name: "BaseState",
          url: "https://base-state.vercel.app/",
          splashImageUrl: "https://base-state.vercel.app/logo.png",
          splashBackgroundColor: "#000000",
        },
      },
    }),
    "fc:miniapp": JSON.stringify({
      version: "1",
      imageUrl: "https://base-state.vercel.app/embed.png",
      button: {
        title: "Launch Mini App",
        action: {
          type: "launch_miniapp",
          name: "BaseState",
          url: "https://base-state.vercel.app/",
          splashImageUrl: "https://base-state.vercel.app/logo.png",
          splashBackgroundColor: "#000000",
        },
      },
    }),
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <RootProvider>
      <html lang="en">
        <body className={`${inter.variable} ${sourceCodePro.variable}`}>
          <SafeArea>
            <FrameReady />
            <WalletCheck />
            {children}
          </SafeArea>
        </body>
      </html>
    </RootProvider>
  );
}
