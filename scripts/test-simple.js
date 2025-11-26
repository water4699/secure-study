const { ethers } = require("hardhat");

async function main() {
  console.log("🧪 Simple Contract Test\n");

  try {
    // Connect to localhost hardhat node
    const provider = new ethers.JsonRpcProvider("http://localhost:8545");
    const signer = await provider.getSigner();
    console.log("📝 Signer address:", await signer.getAddress());

    const contractAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
    console.log("📄 Contract address:", contractAddress);

    // Get contract instance
    const contract = new ethers.Contract(contractAddress, [
      "function getCurrentDate() view returns (uint256)",
      "function getLastStudyDate(address) view returns (uint256)",
      "function getDailyStudyTime(address) view returns (uint32)",
      "function getTotalStudyTime(address) view returns (uint32)",
      "function debugDailyInitialized(address) view returns (bool)",
      "function debugTotalInitialized(address) view returns (bool)",
      "function debugLastStudyDate(address) view returns (uint256)",
      "function recordStudyTime(uint256, bytes) returns ()"
    ], signer);

    console.log("✅ Contract connected successfully!");

    // Test basic function calls
    console.log("\n🧪 Testing basic functions...");

    // First test if contract exists
    try {
      const code = await provider.getCode(contractAddress);
      console.log("📋 Contract code length:", code.length);
      if (code === "0x") {
        console.log("❌ No contract code at this address!");
        return;
      }
    } catch (error) {
      console.log("❌ Failed to get contract code:", error.message);
      return;
    }

    try {
      const currentDate = await contract.getCurrentDate();
      console.log("✅ getCurrentDate():", currentDate.toString());
    } catch (error) {
      console.log("❌ getCurrentDate() failed:", error.message);
      console.log("Error details:", error);
    }

    try {
      const lastDate = await contract.getLastStudyDate(await signer.getAddress());
      console.log("✅ getLastStudyDate():", lastDate.toString());
    } catch (error) {
      console.log("❌ getLastStudyDate() failed:", error.message);
      console.log("Error details:", error);
    }

    // Test recordStudyTime
    console.log("\n🧪 Testing recordStudyTime...");
    try {
      const tx = await contract.recordStudyTime(37, "0x");
      await tx.wait();
      console.log("✅ recordStudyTime(37) transaction completed");
    } catch (error) {
      console.log("❌ recordStudyTime() failed:", error.message);
    }

    // Check state after recording
    console.log("\n🧪 Checking state after recordStudyTime...");
    const userAddress = await signer.getAddress();
    try {
      const dailyInit = await contract.debugDailyInitialized(userAddress);
      const totalInit = await contract.debugTotalInitialized(userAddress);
      const lastDate = await contract.debugLastStudyDate(userAddress);
      const dailyTime = await contract.getDailyStudyTime(userAddress);
      const totalTime = await contract.getTotalStudyTime(userAddress);

      console.log("✅ debugDailyInitialized():", dailyInit);
      console.log("✅ debugTotalInitialized():", totalInit);
      console.log("✅ debugLastStudyDate():", lastDate.toString());
      console.log("✅ getDailyStudyTime():", dailyTime.toString());
      console.log("✅ getTotalStudyTime():", totalTime.toString());
    } catch (error) {
      console.log("❌ State check failed:", error.message);
    }

    console.log("\n🎉 Basic tests completed!");

  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Unexpected error:", error);
    process.exit(1);
  });
