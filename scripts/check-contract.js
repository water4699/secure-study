const { ethers } = require("hardhat");

async function main() {
  // Get the deployed contract
  const EncryptedStudyTracker = await ethers.getContractFactory("EncryptedStudyTracker");
  const contract = await EncryptedStudyTracker.attach("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9");

  console.log("Checking contract state...");

  // Get signers
  const signers = await ethers.getSigners();
  const userAddress = signers[0].address;

  console.log("User address:", userAddress);

  try {
    // Check current date
    const currentDate = await contract.getCurrentDate();
    console.log("Current date:", currentDate.toString());

    // Check last study date
    const lastStudyDate = await contract.getLastStudyDate();
    console.log("Last study date:", lastStudyDate.toString());

    // Check if mappings are initialized (these will return raw encrypted values)
    console.log("\nContract deployed successfully!");
    console.log("Note: The getDailyStudyTime() and getTotalStudyTime() functions return encrypted euint32 values.");
    console.log("In the frontend, these are handled by FHEVM for decryption.");

  } catch (error) {
    console.error("Error checking contract:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
