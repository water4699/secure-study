const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Testing EncryptedStudyTracker contract");
  console.log("Deployer address:", deployer.address);

  // Get contract instance
  const contract = await ethers.getContractAt("EncryptedStudyTracker", "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");

  console.log("Contract address:", contract.target);

  // Test basic functions
  const currentDate = await contract.getCurrentDate();
  const lastDate = await contract.getLastStudyDate();

  console.log("Current date:", currentDate.toString());
  console.log("Last study date:", lastDate.toString());

  // Test encrypted functions (these will return handles)
  const dailyHandle = await contract.getDailyStudyTime();
  const totalHandle = await contract.getTotalStudyTime();

  console.log("Daily study time handle:", dailyHandle);
  console.log("Total study time handle:", totalHandle);

  // Test new decryption request functions
  try {
    console.log("Testing requestDecryptDaily...");
    const requestId = Date.now();
    const decryptDailyTx = await contract.requestDecryptDaily(requestId);
    console.log("requestDecryptDaily transaction:", decryptDailyTx.hash);
    await decryptDailyTx.wait();
    console.log("requestDecryptDaily completed - this creates a transaction and popup in frontend!");
  } catch (error) {
    console.log("requestDecryptDaily failed (expected if no data):", error.message);
  }

  console.log("Contract test completed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
