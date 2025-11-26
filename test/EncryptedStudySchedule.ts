import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EncryptedStudySchedule, EncryptedStudySchedule__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("EncryptedStudySchedule")) as EncryptedStudySchedule__factory;
  const studyScheduleContract = (await factory.deploy()) as EncryptedStudySchedule;
  const studyScheduleContractAddress = await studyScheduleContract.getAddress();

  return { studyScheduleContract, studyScheduleContractAddress };
}

describe("EncryptedStudySchedule", function () {
  let signers: Signers;
  let studyScheduleContract: EncryptedStudySchedule;
  let studyScheduleContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ studyScheduleContract, studyScheduleContractAddress } = await deployFixture());
  });

  it("encrypted schedule data should be uninitialized after deployment", async function () {
    const encryptedGoalCount = await studyScheduleContract.getGoalCount();
    const encryptedCompletedCount = await studyScheduleContract.getCompletedCount();

    // Expect initial values to be bytes32(0) after deployment
    expect(encryptedGoalCount).to.eq(ethers.ZeroHash);
    expect(encryptedCompletedCount).to.eq(ethers.ZeroHash);
  });

  it("should record study schedule and calculate completion rate", async function () {
    // Encrypt schedule data: goal=5, completed=3, priority=2
    const goalCount = 5;
    const completedCount = 3;
    const priority = 2;

    const encryptedGoal = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.alice.address)
      .add32(goalCount)
      .encrypt();

    const encryptedCompleted = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.alice.address)
      .add32(completedCount)
      .encrypt();

    const encryptedPriority = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.alice.address)
      .add32(priority)
      .encrypt();

    // Combine proofs (in real implementation, this would be handled by the frontend)
    // For testing, we'll need to create a combined proof or call separately
    // For now, let's assume we can create a combined encrypted input
    const combinedProof = ethers.concat([encryptedGoal.inputProof, encryptedCompleted.inputProof, encryptedPriority.inputProof]);

    // Record study schedule
    const tx = await studyScheduleContract
      .connect(signers.alice)
      .updateStudySchedule(
        encryptedGoal.handles[0],
        encryptedGoal.inputProof,
        encryptedCompleted.handles[0],
        encryptedCompleted.inputProof,
        encryptedPriority.handles[0],
        encryptedPriority.inputProof
      );
    await tx.wait();

    // Get encrypted values
    const encryptedGoalCount = await studyScheduleContract.getGoalCount();
    const encryptedCompletedCount = await studyScheduleContract.getCompletedCount();
    const encryptedPrioritySum = await studyScheduleContract.getPrioritySum();
    const encryptedTaskCount = await studyScheduleContract.getTaskCount();

    // Check that handles are initialized (non-zero)
    expect(encryptedGoalCount).to.not.eq(ethers.ZeroHash);
    expect(encryptedCompletedCount).to.not.eq(ethers.ZeroHash);

    // Decrypt and verify
    const clearGoalCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedGoalCount,
      studyScheduleContractAddress,
      signers.alice,
    );
    const clearCompletedCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCompletedCount,
      studyScheduleContractAddress,
      signers.alice,
    );
    const clearPrioritySum = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedPrioritySum,
      studyScheduleContractAddress,
      signers.alice,
    );
    const clearTaskCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTaskCount,
      studyScheduleContractAddress,
      signers.alice,
    );

    expect(clearGoalCount).to.eq(goalCount);
    expect(clearCompletedCount).to.eq(completedCount);
    expect(clearPrioritySum).to.eq(priority);
    expect(clearTaskCount).to.eq(1);

    // Calculate completion rate client-side: (completed * 100) / goal
    const completionRate = (Number(clearCompletedCount) * 100) / Number(clearGoalCount);
    expect(completionRate).to.eq(60); // 3/5 * 100 = 60%

    // Calculate average priority client-side: prioritySum / taskCount
    const avgPriority = Number(clearPrioritySum) / Number(clearTaskCount);
    expect(avgPriority).to.eq(2); // 2/1 = 2
  });

  it("should accumulate multiple study schedule entries", async function () {
    // First entry: goal=3, completed=2, priority=1
    const goal1 = 3;
    const completed1 = 2;
    const priority1 = 1;

    const encryptedGoal1 = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.alice.address)
      .add32(goal1)
      .encrypt();

    const encryptedCompleted1 = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.alice.address)
      .add32(completed1)
      .encrypt();

    const encryptedPriority1 = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.alice.address)
      .add32(priority1)
      .encrypt();

    let tx = await studyScheduleContract
      .connect(signers.alice)
      .updateStudySchedule(
        encryptedGoal1.handles[0],
        encryptedGoal1.inputProof,
        encryptedCompleted1.handles[0],
        encryptedCompleted1.inputProof,
        encryptedPriority1.handles[0],
        encryptedPriority1.inputProof
      );
    await tx.wait();

    // Second entry: goal=2, completed=1, priority=3
    const goal2 = 2;
    const completed2 = 1;
    const priority2 = 3;

    const encryptedGoal2 = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.alice.address)
      .add32(goal2)
      .encrypt();

    const encryptedCompleted2 = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.alice.address)
      .add32(completed2)
      .encrypt();

    const encryptedPriority2 = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.alice.address)
      .add32(priority2)
      .encrypt();

    tx = await studyScheduleContract
      .connect(signers.alice)
      .updateStudySchedule(
        encryptedGoal2.handles[0],
        encryptedGoal2.inputProof,
        encryptedCompleted2.handles[0],
        encryptedCompleted2.inputProof,
        encryptedPriority2.handles[0],
        encryptedPriority2.inputProof
      );
    await tx.wait();

    // Get encrypted values
    const encryptedGoalCount = await studyScheduleContract.getGoalCount();
    const encryptedCompletedCount = await studyScheduleContract.getCompletedCount();
    const encryptedPrioritySum = await studyScheduleContract.getPrioritySum();
    const encryptedTaskCount = await studyScheduleContract.getTaskCount();

    // Decrypt and verify
    const clearGoalCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedGoalCount,
      studyScheduleContractAddress,
      signers.alice,
    );
    const clearCompletedCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedCompletedCount,
      studyScheduleContractAddress,
      signers.alice,
    );
    const clearPrioritySum = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedPrioritySum,
      studyScheduleContractAddress,
      signers.alice,
    );
    const clearTaskCount = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      encryptedTaskCount,
      studyScheduleContractAddress,
      signers.alice,
    );

    expect(clearGoalCount).to.eq(goal1 + goal2); // 3 + 2 = 5
    expect(clearCompletedCount).to.eq(completed1 + completed2); // 2 + 1 = 3
    expect(clearPrioritySum).to.eq(priority1 + priority2); // 1 + 3 = 4
    expect(clearTaskCount).to.eq(2); // Two entries

    // Calculate completion rate: (3 * 100) / 5 = 60%
    const completionRate = (Number(clearCompletedCount) * 100) / Number(clearGoalCount);
    expect(completionRate).to.eq(60);

    // Calculate average priority: 4 / 2 = 2
    const avgPriority = Number(clearPrioritySum) / Number(clearTaskCount);
    expect(avgPriority).to.eq(2);
  });

  it("should maintain separate schedule records for different users", async function () {
    // Alice's schedule: goal=4, completed=3, priority=2
    const aliceGoal = 4;
    const aliceCompleted = 3;
    const alicePriority = 2;

    const encryptedAliceGoal = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.alice.address)
      .add32(aliceGoal)
      .encrypt();

    const encryptedAliceCompleted = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.alice.address)
      .add32(aliceCompleted)
      .encrypt();

    const encryptedAlicePriority = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.alice.address)
      .add32(alicePriority)
      .encrypt();

    let tx = await studyScheduleContract
      .connect(signers.alice)
      .updateStudySchedule(
        encryptedAliceGoal.handles[0],
        encryptedAliceGoal.inputProof,
        encryptedAliceCompleted.handles[0],
        encryptedAliceCompleted.inputProof,
        encryptedAlicePriority.handles[0],
        encryptedAlicePriority.inputProof
      );
    await tx.wait();

    // Bob's schedule: goal=6, completed=4, priority=1
    const bobGoal = 6;
    const bobCompleted = 4;
    const bobPriority = 1;

    const encryptedBobGoal = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.bob.address)
      .add32(bobGoal)
      .encrypt();

    const encryptedBobCompleted = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.bob.address)
      .add32(bobCompleted)
      .encrypt();

    const encryptedBobPriority = await fhevm
      .createEncryptedInput(studyScheduleContractAddress, signers.bob.address)
      .add32(bobPriority)
      .encrypt();

    const bobProof = ethers.concat([encryptedBobGoal.inputProof, encryptedBobCompleted.inputProof, encryptedBobPriority.inputProof]);

    tx = await studyScheduleContract
      .connect(signers.bob)
      .updateStudySchedule(
        encryptedBobGoal.handles[0],
        encryptedBobCompleted.handles[0],
        encryptedBobPriority.handles[0],
        bobProof
      );
    await tx.wait();

    // Verify Alice's records
    const aliceGoalCount = await studyScheduleContract.connect(signers.alice).getGoalCount();
    const aliceCompletedCount = await studyScheduleContract.connect(signers.alice).getCompletedCount();

    const aliceClearGoal = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      aliceGoalCount,
      studyScheduleContractAddress,
      signers.alice,
    );
    const aliceClearCompleted = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      aliceCompletedCount,
      studyScheduleContractAddress,
      signers.alice,
    );

    expect(aliceClearGoal).to.eq(aliceGoal);
    expect(aliceClearCompleted).to.eq(aliceCompleted);

    // Verify Bob's records
    const bobGoalCount = await studyScheduleContract.connect(signers.bob).getGoalCount();
    const bobCompletedCount = await studyScheduleContract.connect(signers.bob).getCompletedCount();

    const bobClearGoal = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      bobGoalCount,
      studyScheduleContractAddress,
      signers.bob,
    );
    const bobClearCompleted = await fhevm.userDecryptEuint(
      FhevmType.euint32,
      bobCompletedCount,
      studyScheduleContractAddress,
      signers.bob,
    );

    expect(bobClearGoal).to.eq(bobGoal);
    expect(bobClearCompleted).to.eq(bobCompleted);
  });
});

