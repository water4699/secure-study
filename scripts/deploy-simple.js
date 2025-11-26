const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying contracts...");

  // Get signers
  const [deployer] = await ethers.getSigners();
  console.log("📝 Deploying contracts with account:", deployer.address);
  console.log("📝 Network:", await ethers.provider.getNetwork());

  // Deploy FHECounter
  console.log("📦 Deploying FHECounter...");
  const FHECounter = await ethers.getContractFactory("FHECounter");
  const fheCounter = await FHECounter.deploy();
  await fheCounter.waitForDeployment();
  console.log("✅ FHECounter deployed to:", await fheCounter.getAddress());

  // Deploy EncryptedStudyTracker
  console.log("📦 Deploying EncryptedStudyTracker...");
  const EncryptedStudyTracker = await ethers.getContractFactory("EncryptedStudyTracker");
  const encryptedStudyTracker = await EncryptedStudyTracker.deploy();
  await encryptedStudyTracker.waitForDeployment();
  const studyTrackerAddress = await encryptedStudyTracker.getAddress();
  console.log("✅ EncryptedStudyTracker deployed to:", studyTrackerAddress);

  // Save deployment info
  const fs = require("fs");
  const path = require("path");

  const deploymentsDir = path.join(__dirname, "..", "deployments", "localhost");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save FHECounter deployment
  const fheCounterInfo = {
    address: await fheCounter.getAddress(),
    abi: JSON.parse(FHECounter.interface.formatJson()),
    receipt: await fheCounter.deploymentTransaction()?.wait()
  };
  fs.writeFileSync(
    path.join(deploymentsDir, "FHECounter.json"),
    JSON.stringify(fheCounterInfo, null, 2)
  );

  // Save EncryptedStudyTracker deployment
  const studyTrackerInfo = {
    address: studyTrackerAddress,
    abi: JSON.parse(EncryptedStudyTracker.interface.formatJson()),
    receipt: await encryptedStudyTracker.deploymentTransaction()?.wait()
  };
  fs.writeFileSync(
    path.join(deploymentsDir, "EncryptedStudyTracker.json"),
    JSON.stringify(studyTrackerInfo, null, 2)
  );

  console.log("💾 Deployment files saved to:", deploymentsDir);
  console.log("\n🎉 All contracts deployed successfully!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
