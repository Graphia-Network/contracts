require('dotenv').config();

import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-docgen";
import "hardhat-abi-exporter";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  docgen: {
    // exclude for now, until it's finished
    exclude: ["**Escrow.sol"],
    outputDir: "docs",
    theme: "markdown",
  },
  abiExporter: {
    clear: true,
    only: ['Assets'],
  },
  networks: {
    sepolia: {
      url: "https://rpc.sepolia.org",
      chainId: 11155111,
      ...(process.env.PK && {
        accounts: [process.env.PK]
      })
    },
  }
};

export default config;
