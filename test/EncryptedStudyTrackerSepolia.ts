import { ethers } from "ethers";
import { fhevm, deployments } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { EncryptedStudyTracker } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  alice: HardhatEthersSigner;
};

describe("EncryptedStudyTrackerSepolia", function () {
  let signers: Signers;
  let studyTrackerContract: EncryptedStudyTracker;
  let studyTrackerContractAddress: string;
  let step: number;
  let steps: number;

  function progress(message: string) {
    console.log(`${++step}/${steps} ${message}`);
  }

  before(async function () {
    if (fhevm.isMock) {
      console.warn(`This hardhat test suite can only run on Sepolia Testnet`);
      this.skip();
    }

    try {
      const studyTrackerDeployment = await deployments.get("EncryptedStudyTracker");
      studyTrackerContractAddress = studyTrackerDeployment.address;
      studyTrackerContract = await ethers.getContractAt("EncryptedStudyTracker", studyTrackerDeployment.address);
    } catch (e) {
      (e as Error).message += ". Call 'npx hardhat deploy --network sepolia'";
      throw e;
    }

    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { alice: ethSigners[0] };
  });

  beforeEach(async () => {
    step = 0;
    steps = 0;
  });

  it("record study time and decrypt daily/total time", async function () {
    steps = 12;

    this.timeout(4 * 40000);

    progress("Encrypting '30' minutes...");
    const encryptedThirty = await fhevm
      .createEncryptedInput(studyTrackerContractAddress, signers.alice.address)
      .add32(30)
      .encrypt();

    progress(
      `Call recordStudyTime(30) EncryptedStudyTracker=${studyTrackerContractAddress} handle=${ethers.hexlify(encryptedThirty.handles[0])} signer=${signers.alice.address}...`,
    );
    let tx = await studyTrackerContract
      .connect(signers.alice)
      .recordStudyTime(encryptedThirty.handles[0], encryptedThirty.inputProof);
    await tx.wait();

    progress(`Call EncryptedStudyTracker.getDailyStudyTime()...`);
    const encryptedDailyTime = await studyTrackerContract.getDailyStudyTime();
    expect(encryptedDailyTime).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting daily study time=${encryptedDailyTime}...`);
    const clearDailyTime = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedDailyTime,
      studyTrackerContractAddress,
      signers.alice,
    );
    progress(`Clear daily study time=${clearDailyTime} minutes`);
    expect(clearDailyTime).to.eq(30);

    progress(`Call EncryptedStudyTracker.getTotalStudyTime()...`);
    const encryptedTotalTime = await studyTrackerContract.getTotalStudyTime();
    expect(encryptedTotalTime).to.not.eq(ethers.ZeroHash);

    progress(`Decrypting total study time=${encryptedTotalTime}...`);
    const clearTotalTime = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotalTime,
      studyTrackerContractAddress,
      signers.alice,
    );
    progress(`Clear total study time=${clearTotalTime} minutes`);
    expect(clearTotalTime).to.eq(30);

    progress(`Encrypting '45' minutes...`);
    const encryptedFortyFive = await fhevm
      .createEncryptedInput(studyTrackerContractAddress, signers.alice.address)
      .add32(45)
      .encrypt();

    progress(
      `Call recordStudyTime(45) EncryptedStudyTracker=${studyTrackerContractAddress} handle=${ethers.hexlify(encryptedFortyFive.handles[0])} signer=${signers.alice.address}...`,
    );
    tx = await studyTrackerContract
      .connect(signers.alice)
      .recordStudyTime(encryptedFortyFive.handles[0], encryptedFortyFive.inputProof);
    await tx.wait();

    progress(`Call EncryptedStudyTracker.getDailyStudyTime() after second recording...`);
    const encryptedDailyTimeAfter = await studyTrackerContract.getDailyStudyTime();

    progress(`Decrypting daily study time after second recording=${encryptedDailyTimeAfter}...`);
    const clearDailyTimeAfter = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedDailyTimeAfter,
      studyTrackerContractAddress,
      signers.alice,
    );
    progress(`Clear daily study time after second recording=${clearDailyTimeAfter} minutes`);
    expect(clearDailyTimeAfter).to.eq(75); // 30 + 45

    progress(`Call EncryptedStudyTracker.getTotalStudyTime() after second recording...`);
    const encryptedTotalTimeAfter = await studyTrackerContract.getTotalStudyTime();

    progress(`Decrypting total study time after second recording=${encryptedTotalTimeAfter}...`);
    const clearTotalTimeAfter = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTotalTimeAfter,
      studyTrackerContractAddress,
      signers.alice,
    );
    progress(`Clear total study time after second recording=${clearTotalTimeAfter} minutes`);
    expect(clearTotalTimeAfter).to.eq(75); // 30 + 45
  });
});
