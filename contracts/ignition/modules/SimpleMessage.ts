// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MessageSystemModule = buildModule("MessageSystemModule", (m) => {
  // 1. Deploy SimpleMessage contract first
  const simpleMessage = m.contract("SimpleMessage");

  // 2. Get CrossChainLayer address based on network
  const crossChainLayerAddress = m.getParameter(
    "crossChainLayerAddress",
    getCrossChainLayerAddress()
  );

  // 3. Deploy MessageProxy contract with SimpleMessage and CrossChainLayer addresses
  const messageProxy = m.contract("SimpleMessageProxy", [
    simpleMessage,
    crossChainLayerAddress,
  ]);

  return {
    simpleMessage,
    messageProxy,
  };
});

function getCrossChainLayerAddress(): string {
  // Default to TAC testnet CrossChainLayer address
  return "0x4f3b05a601B7103CF8Fc0aBB56d042e04f222ceE";

  // For mainnet, use: 0x9fee01e948353E0897968A3ea955815aaA49f58d (https://docs.tac.build/build/tooling/contract-addresses)
}

export default MessageSystemModule;
