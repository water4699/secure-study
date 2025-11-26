import { FhevmType } from "@fhevm/hardhat-plugin";
import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

/**
 * Tutorial: Deploy and Interact Locally (--network localhost)
 * ===========================================================
 *
 * 1. From a separate terminal window:
 *
 *   npx hardhat node
 *
 * 2. Deploy the EncryptedStudyTracker contract
 *
 *   npx hardhat --network localhost deploy
 *
 * 3. Interact with the EncryptedStudyTracker contract
 *
 *   npx hardhat --network localhost task:study-record --minutes 30
 *   npx hardhat --network localhost task:study-decrypt-daily
 *   npx hardhat --network localhost task:study-decrypt-total
 *   npx hardhat --network localhost task:study-record --minutes 45
 *   npx hardhat --network localhost task:study-decrypt-daily
 *   npx hardhat --network localhost task:study-decrypt-total
 *
 *
 * Tutorial: Deploy and Interact on Sepolia (--network sepolia)
 * ===========================================================
 *
 * 1. Deploy the EncryptedStudyTracker contract
 *
 *   npx hardhat --network sepolia deploy
 *
 * 2. Interact with the EncryptedStudyTracker contract
 *
 *   npx hardhat --network sepolia task:study-record --minutes 30
 *   npx hardhat --network sepolia task:study-decrypt-daily
 *   npx hardhat --network sepolia task:study-decrypt-total
 *
 */

/**
 * Example:
 *   - npx hardhat --network localhost task:study-address
 *   - npx hardhat --network sepolia task:study-address
 */
task("task:study-address", "Prints the EncryptedStudyTracker address").setAction(async function (_taskArguments: TaskArguments, hre) {
  const { deployments } = hre;

  const studyTracker = await deployments.get("EncryptedStudyTracker");

  console.log("EncryptedStudyTracker address is " + studyTracker.address);
});

/**
 * Example:
 *   - npx hardhat --network localhost task:study-decrypt-daily
 *   - npx hardhat --network sepolia task:study-decrypt-daily
 */
task("task:study-decrypt-daily", "Decrypts the daily study time from EncryptedStudyTracker Contract")
  .addOptionalParam("address", "Optionally specify the EncryptedStudyTracker contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const studyTrackerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedStudyTracker");
    console.log(`EncryptedStudyTracker: ${studyTrackerDeployment.address}`);

    const signers = await ethers.getSigners();

    const studyTrackerContract = await ethers.getContractAt("EncryptedStudyTracker", studyTrackerDeployment.address);

    const encryptedDailyTime = await studyTrackerContract.getDailyStudyTime();
    if (encryptedDailyTime === ethers.ZeroHash) {
      console.log(`encrypted daily time: ${encryptedDailyTime}`);
      console.log("clear daily time    : 0 minutes");
      return;
    }

    const clearDailyTime = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedDailyTime,
      studyTrackerDeployment.address,
      signers[0],
    );
    console.log(`Encrypted daily time: ${encryptedDailyTime}`);
    console.log(`Clear daily time    : ${clearDailyTime} minutes`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:study-decrypt-total
 *   - npx hardhat --network sepolia task:study-decrypt-total
 */
task("task:study-decrypt-total", "Decrypts the total study time from EncryptedStudyTracker Contract")
  .addOptionalParam("address", "Optionally specify the EncryptedStudyTracker contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    await fhevm.initializeCLIApi();

    const studyTrackerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedStudyTracker");
    console.log(`EncryptedStudyTracker: ${studyTrackerDeployment.address}`);

    const signers = await ethers.getSigners();

    const studyTrackerContract = await ethers.getContractAt("EncryptedStudyTracker", studyTrackerDeployment.address);

    const encryptedTotalTime = await studyTrackerContract.getTotalStudyTime();
    if (encryptedTotalTime === ethers.ZeroHash) {
      console.log(`encrypted total time: ${encryptedTotalTime}`);
      console.log("clear total time    : 0 minutes");
      return;
    }

    const clearTotalTime = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotalTime,
      studyTrackerDeployment.address,
      signers[0],
    );
    console.log(`Encrypted total time: ${encryptedTotalTime}`);
    console.log(`Clear total time    : ${clearTotalTime} minutes`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:study-record --minutes 30
 *   - npx hardhat --network sepolia task:study-record --minutes 30
 */
task("task:study-record", "Records study time in the EncryptedStudyTracker Contract")
  .addOptionalParam("address", "Optionally specify the EncryptedStudyTracker contract address")
  .addParam("minutes", "The study time in minutes")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;

    const minutes = parseInt(taskArguments.minutes);
    if (!Number.isInteger(minutes) || minutes <= 0) {
      throw new Error(`Argument --minutes must be a positive integer`);
    }

    await fhevm.initializeCLIApi();

    const studyTrackerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedStudyTracker");
    console.log(`EncryptedStudyTracker: ${studyTrackerDeployment.address}`);

    const signers = await ethers.getSigners();

    const studyTrackerContract = await ethers.getContractAt("EncryptedStudyTracker", studyTrackerDeployment.address);

    // Encrypt the study time value
    const encryptedStudyTime = await fhevm
      .createEncryptedInput(studyTrackerDeployment.address, signers[0].address)
      .add32(minutes)
      .encrypt();

    const tx = await studyTrackerContract
      .connect(signers[0])
      .recordStudyTime(encryptedStudyTime.handles[0], encryptedStudyTime.inputProof);
    console.log(`Wait for tx:${tx.hash}...`);

    const receipt = await tx.wait();
    console.log(`tx:${tx.hash} status=${receipt?.status}`);

    console.log(`EncryptedStudyTracker recordStudyTime(${minutes} minutes) succeeded!`);
  });

/**
 * Example:
 *   - npx hardhat --network localhost task:study-info
 *   - npx hardhat --network sepolia task:study-info
 */
task("task:study-info", "Shows current study information from EncryptedStudyTracker Contract")
  .addOptionalParam("address", "Optionally specify the EncryptedStudyTracker contract address")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments } = hre;

    const studyTrackerDeployment = taskArguments.address
      ? { address: taskArguments.address }
      : await deployments.get("EncryptedStudyTracker");
    console.log(`EncryptedStudyTracker: ${studyTrackerDeployment.address}`);

    const studyTrackerContract = await ethers.getContractAt("EncryptedStudyTracker", studyTrackerDeployment.address);

    const currentDate = await studyTrackerContract.getCurrentDate();
    const lastStudyDate = await studyTrackerContract.getLastStudyDate();

    console.log(`Current date: ${currentDate}`);
    console.log(`Last study date: ${lastStudyDate}`);
    console.log(`Daily time handle: ${await studyTrackerContract.getDailyStudyTime()}`);
    console.log(`Total time handle: ${await studyTrackerContract.getTotalStudyTime()}`);
  });
