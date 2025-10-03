import { Inter, Source_Code_Pro } from "next/font/google";
import { RootProvider } from "./rootProvider";
import { SafeArea } from "@coinbase/onchainkit/minikit";
import FrameReady from "./components/FrameReady";
import WalletCheck from "./components/WalletCheck";
import "./globals.css";

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
