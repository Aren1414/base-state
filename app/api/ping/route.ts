import { NextResponse } from "next/server";
import { createWalletClient, http, encodeFunctionData } from "viem";
import { base } from "viem/chains";

const CONTRACT_ADDRESS = "0xCDbb19b042DFf53F0a30Da02cCfA24fb25fcEb1d";

export async function POST(req: Request) {
  try {
    const { address } = await req.json();

    const wallet = createWalletClient({
      chain: base,
      transport: http(),
    });

    const data = encodeFunctionData({
      abi: [
        { inputs: [], name: "ping", outputs: [], stateMutability: "nonpayable", type: "function" },
      ],
      functionName: "ping",
      args: [],
    });

    const hash = await wallet.sendTransaction({
      account: address as `0x${string}`,
      to: CONTRACT_ADDRESS,
      data,
    });

    return NextResponse.json({ hash });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
