import type { Metadata } from "next";
import { Inter, Source_Code_Pro } from "next/font/google";
import { minikitConfig } from "../minikit.config";
import { RootProvider } from "./rootProvider";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import FrameReady from "./components/FrameReady";
import WalletCheck from "./components/WalletCheck";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: minikitConfig.frame.name,
    description: minikitConfig.frame.description,
    other: {
      "fc:frame": JSON.stringify({
        version: minikitConfig.frame.version,
        imageUrl: minikitConfig.frame.heroImageUrl,
        button: {
          title: "Launch Mini App",
          action: {
            type: "launch_frame",
            name: minikitConfig.frame.name,
            url: minikitConfig.frame.homeUrl,
            splashImageUrl: minikitConfig.frame.splashImageUrl,
            splashBackgroundColor: minikitConfig.frame.splashBackgroundColor,
          },
        },
      }),
      "fc:miniapp": JSON.stringify({
        version: minikitConfig.frame.version,
        imageUrl: minikitConfig.frame.heroImageUrl,
        button: {
          title: "Launch Mini App",
          action: {
            type: "launch_miniapp",
            name: minikitConfig.frame.name,
            url: minikitConfig.frame.homeUrl,
            splashImageUrl: minikitConfig.frame.splashImageUrl,
            splashBackgroundColor: minikitConfig.frame.splashBackgroundColor,
          },
        },
      }),
    },
  };
}

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const sourceCodePro = Source_Code_Pro({ variable: "--font-source-code-pro", subsets: ["latin"] });

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
