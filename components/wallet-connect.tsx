"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTonConnect } from "@/hooks/use-ton-connect";
import { Wallet, LogOut } from "lucide-react";
import { useTonAddress } from "@tonconnect/ui-react";

export function WalletConnect() {
  const { wallet, connected, connect, disconnect } = useTonConnect();
  const address = useTonAddress(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    if (connected) {
      try {
        await disconnect();
      } catch {
        console.error("Failed to disconnect wallet");
      }
      return;
    }

    setIsConnecting(true);

    try {
      await connect();
    } catch {
      console.error("Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-6)}`;
  };

  return (
    <Button
      variant={"outline"}
      size="lg"
      onClick={handleConnect}
      disabled={isConnecting}
      className="min-w-[180px]"
    >
      {isConnecting ? (
        <>
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Connecting...
        </>
      ) : connected && wallet ? (
        <>
          <LogOut className="w-4 h-4" />
          {formatAddress(address)}
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4" />
          Connect TON Wallet
        </>
      )}
    </Button>
  );
}
