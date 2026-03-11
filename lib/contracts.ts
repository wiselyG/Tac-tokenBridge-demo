import { ethers } from "ethers";
import type { EvmProxyMsg } from "@tonappchain/sdk";

export const CONTRACT_ADDRESS = {
  // TAC Proxy Contract Address for the Simple Message Contract
  MESSAGE_PROXY: "0xe3E475d7F7EA690875C65C30856547fcE3E28F20",
} as const;

export function createSimpleMessageTransaction(message: string): EvmProxyMsg {
  const encodedArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string"],
    [message]
  );

  return {
    evmTargetAddress: CONTRACT_ADDRESS.MESSAGE_PROXY,
    methodName: "forwardMessage(bytes,bytes)",
    encodedParameters: encodedArgs,
  };
}
