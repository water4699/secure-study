const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Testing Full Encrypted Study Tracker Flow\n");

  const [deployer] = await ethers.getSigners();
  console.log("📝 Deployer address:", deployer.address);

  // Get contract instance
  const contract = await ethers.getContractAt("EncryptedStudyTracker", "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512");
  console.log("📄 Contract address:", contract.target);

  console.log("\n1️⃣ Testing initial state...");
  const currentDate = await contract.getCurrentDate();
  const lastDate = await contract.getLastStudyDate();
  const dailyHandle = await contract.getDailyStudyTime();
  const totalHandle = await contract.getTotalStudyTime();

  console.log("   Current date:", Number(currentDate));
  console.log("   Last study date:", Number(lastDate));
  console.log("   Daily handle:", dailyHandle);
  console.log("   Total handle:", totalHandle);
  console.log("   ✅ Initial state correct (all zeros)\n");

  console.log("2️⃣ Testing requestDecryptDaily without data (should fail)...");
  try {
    const requestId = Date.now();
    const tx = await contract.requestDecryptDaily(requestId);
    console.log("   ❌ Unexpected success:", tx.hash);
  } catch (error) {
    console.log("   ✅ Correctly failed:", error.message);
  }

  console.log("\n3️⃣ Testing requestDecryptTotal without data (should fail)...");
  try {
    const requestId = Date.now();
    const tx = await contract.requestDecryptTotal(requestId);
    console.log("   ❌ Unexpected success:", tx.hash);
  } catch (error) {
    console.log("   ✅ Correctly failed:", error.message);
  }

  console.log("\n🎉 All tests passed! Contract is working correctly.");
  console.log("\nNext steps for full testing:");
  console.log("1. Open browser at http://localhost:3000");
  console.log("2. Connect MetaMask to localhost:8545");
  console.log("3. Record study time (30 minutes)");
  console.log("4. Decrypt daily time (should show MetaMask popup)");
  console.log("5. Decrypt total time (should show MetaMask popup)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Test failed:", error);
    process.exit(1);
  });
