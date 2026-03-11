"use client";

import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";
import { useCallback } from "react";

export function useTonConnect() {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();

  const connect = useCallback(async () => {
    try {
      await tonConnectUI.connectWallet();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  }, [tonConnectUI]);

  const disconnect = useCallback(async () => {
    try {
      await tonConnectUI.disconnect();
    } catch (error) {
      console.error("Failed to disconnect wallet:", error);
      throw error;
    }
  }, [tonConnectUI]);

  return {
    wallet,
    connected: !!wallet,
    connect,
    disconnect,
    tonConnectUI,
  };
}