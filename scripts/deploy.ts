import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  const assets = await ethers.deployContract("Assets", ["", deployer.address]);

  await assets.waitForDeployment();

  console.log(
    "Assets deployed to:",
    await assets.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
