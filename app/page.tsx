import { Button } from "@/components/ui/button";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { WalletConnect } from "@/components/wallet-connect";
import { CrossChainMessageButton } from "@/components/cross-chain-message-button";

export default function Home() {
  return (
    <div className="bg-white font-sans max-w-5xl mx-auto min-h-screen py-[10rem] px-[5rem] flex flex-col  justify-between">
      <div className="relative">
        <div className="h-[10rem] ">
          <TextHoverEffect text="TAC" fontSize="text-[10rem]" />
        </div>
        <div className="absolute top-0 right-0">
          <WalletConnect />
        </div>
      </div>

      <div className="flex flex-col gap-4 ">
        <h1 className="text-4xl font-semibold tracking-tight w-3/4">
          Build Your First Hybrid Application.
        </h1>
        <p className="text-lg  text-muted-foreground font-medium w-3/5">
          Connect your <span className="text-black">TON wallet</span> and send a
          message directly to an{" "}
          <span className="text-black">EVM smart contract</span>. See real-time{" "}
          <span className="text-black">tracking</span> as your transaction
          executes across chains.
        </p>
      </div>
      <div className="flex gap-4">
        <CrossChainMessageButton />
        <Button variant={"outline"} size={"lg"}>
          Documentation
        </Button>
      </div>
    </div>
  );
}
