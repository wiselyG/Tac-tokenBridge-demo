import { ethers } from "ethers";
import type { EvmProxyMsg } from "@tonappchain/sdk";

export const CONTRACT_ADDRESS = {
  // TAC Proxy Contract Address for the Simple Message Contract
  //  MESSAGE_PROXY: "0x4da5325bb5ad91a91a56546fea9ac1d589984d5e",
  MESSAGE_PROXY: "0x2b5cd9130f72cad9053b302bb004c0f91e9764d1",
} as const;

export function createSimpleMessageTransaction(address: string,_amount:number,method:string): EvmProxyMsg {
  const amount=BigInt(Math.floor(_amount*Math.pow(10,18)));
  const encodedArgs = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string","uint256"],
    [address,amount]
  );
  const methodName =`${method}(bytes,bytes)`;
  return {
    evmTargetAddress: CONTRACT_ADDRESS.MESSAGE_PROXY,
    methodName: methodName,
    encodedParameters: encodedArgs,
  };
}
