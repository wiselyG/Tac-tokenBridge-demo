import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    tacMainnet: {
      url: "https://rpc.tac.build",
      chainId: 239,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    tacTestnet: {
      url: "https://spb.rpc.tac.build",
      chainId: 2391,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
  },
};

export default config;
