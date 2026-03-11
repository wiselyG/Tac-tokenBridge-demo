"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TransactionTracker } from "@/components/transaction-tracker";
import { useTonConnect } from "@/hooks/use-ton-connect";
import { useTacSdk } from "@/hooks/use-tac-sdk";
import { createSimpleMessageTransaction } from "@/lib/contracts";
import { SendToBack, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export function CrossChainMessageButton() {
  const { connected } = useTonConnect();
  const { sendCrossChainTransaction, transactionState, isReady, initError } =
    useTacSdk();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTracker, setShowTracker] = useState(false);

  useEffect(() => {
    if (transactionState.error) {
      toast.error("Transaction Failed");
    }
  }, [transactionState.error]);

  const handleClick = async () => {
    if (!connected || !isReady) return;

    try {
      const message = "Hello from TON to EVM!";
      const evmProxyMsg = createSimpleMessageTransaction(message);

      const transactionLinker = await sendCrossChainTransaction(evmProxyMsg);

      if (transactionLinker) {
        setShowSuccess(true);
        setShowTracker(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Cross-chain transaction failed:", error);
    }
  };

  if (initError) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button size="lg" disabled variant="destructive">
              <AlertCircle className="w-4 h-4" />
              SDK Error
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{initError}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  if (!connected) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button size="lg" disabled>
              <SendToBack className="w-4 h-4" />
              Send Cross-Chain Message
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Connect TON Wallet</p>
        </TooltipContent>
      </Tooltip>
    );
  }
  if (!isReady) {
    return (
      <Button size="lg" disabled>
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        Initializing SDK...
      </Button>
    );
  }

  if (showSuccess) {
    return (
      <Button size="lg" variant="secondary" disabled>
        <SendToBack className="w-4 h-4" />
        Transaction Sent!
      </Button>
    );
  }

  return (
    <>
      <Button
        size="lg"
        onClick={handleClick}
        disabled={transactionState.isLoading}
      >
        {transactionState.isLoading ? (
          <>
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Sending...
          </>
        ) : transactionState.error ? (
          <>
            <SendToBack className="w-4 h-4" />
            Try Again
          </>
        ) : (
          <>
            <SendToBack className="w-4 h-4" />
            Send Cross-Chain Message
          </>
        )}
      </Button>
      {showTracker && (
        <TransactionTracker
          transactionLinker={transactionState.transactionLinker}
          onClose={() => setShowTracker(false)}
        />
      )}
    </>
  );
}
