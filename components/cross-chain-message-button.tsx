"use client";

import React, { useState, useEffect,useRef } from "react";
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

interface FormData{
  limit: number;
}
interface Option{
  label: string;
  value: string;
}

const methods: Option[] = [
  { label: 'Mint', value: 'mintTo' },
  { label: 'transferTo', value: 'transferTo' },
  { label: '余额', value: 'balanceOf' },
  { label: '信息', value: 'info' },
];

export function CrossChainMessageButton() {
  const { connected } = useTonConnect();
  const { sendCrossChainTransaction, transactionState, isReady, initError } =
    useTacSdk();
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTracker, setShowTracker] = useState(false);
  const addressRef = useRef<HTMLInputElement>(null);
  const options =[1,100,1000];
  const [formData,setFormData] = useState<FormData>({limit:100});
  const [selected,setSelected] =useState<string>('mint');

  useEffect(() => {
    if (transactionState.error) {
      toast.error("Transaction Failed");
    }
  }, [transactionState.error]);

  const handleChange=(e:React.ChangeEvent<HTMLSelectElement>)=>{
    setFormData({
      ...formData,
      limit: Number(e.target.value),
    });
  };

  const handleSubmit=async (e:React.SyntheticEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const address =addressRef.current?.value.trim() ||"";
    
    console.log("send to:",address);
    console.log("amount:",formData.limit);
    console.log("selected:",selected);

    if (!connected || !isReady) return;

    try {
      // const addr1="0xe4c9ee80815d442d464cffd248f40f5d148f23c5";
      const evmProxyMsg = createSimpleMessageTransaction(address,formData.limit,selected);
      console.log("1111");
      const transactionLinker = await sendCrossChainTransaction(evmProxyMsg);
      console.log("22222");
      
      if (transactionLinker) {
        setShowSuccess(true);
        setShowTracker(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Cross-chain transaction failed:", error);
    }
  }

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
      <form onSubmit={handleSubmit} className="flex flex-col items-start gap-4 ml-2.5">
        <input type="text" ref={addressRef} placeholder="input wallet address."/>
        <label>
          choose amount:
          <select value={formData.limit} onChange={handleChange}>
            {options.map((num)=>(
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </label>
        <div>
          {methods.map((op)=>(
            <label key={op.value}
               style={{ 
                  marginRight: '15px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
              <input 
                 type="radio"
                 name="action"
                 value ={op.value}
                 checked={selected ===op.value}
                 onChange={(e) => setSelected(e.target.value)}
                  style={{ marginRight: '5px' }}
                />
                {op.label}
            </label>
          ))}
        </div>
        <label>
        </label>
          <Button
            size="lg"
            type="submit"
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
      </form>
      {showTracker && (
        <TransactionTracker
          transactionLinker={transactionState.transactionLinker}
          onClose={() => setShowTracker(false)}
        />
      )}
    </>
  );
}
