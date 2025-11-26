const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Testing deployment...");

  try {
    const [deployer] = await ethers.getSigners();
    console.log("Deployer:", deployer.address);

    console.log("Deploying contract...");
    const EncryptedStudyTracker = await ethers.getContractFactory("EncryptedStudyTracker");
    const contract = await EncryptedStudyTracker.deploy();

    console.log("Waiting for deployment...");
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("✅ Contract deployed to:", address);

    // Test a simple call
    console.log("Testing getCurrentDate()...");
    const result = await contract.getCurrentDate();
    console.log("✅ getCurrentDate():", result.toString());

  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

main();
