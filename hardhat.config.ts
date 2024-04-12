import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-docgen";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  docgen: {
    outputDir: "docs",
    theme: "markdown",
  }
};

export default config;
