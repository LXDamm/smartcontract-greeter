import { ethers } from "hardhat";

async function main() {
  const encodedHelloWorlMessage = await ethers.encodeBytes32String('Hello World');
  const greeter = await ethers.deployContract("Greeter", [encodedHelloWorlMessage]);

  await greeter.waitForDeployment();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
