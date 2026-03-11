"use client";

import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { ReactNode } from "react";

const manifestUrl =
  "https://raw.githubusercontent.com/TacBuild/starter-frontend/refs/heads/main/public/tonconnect-manifest.json";

interface TonConnectProviderProps {
  children: ReactNode;
}

export function TonConnectProvider({ children }: TonConnectProviderProps) {
  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      {children}
    </TonConnectUIProvider>
  );
}
