//////////////////////////////////////////////////////////////////////////
//
// WARNING!!
// ALWAY USE DYNAMICALLY IMPORT THIS FILE TO AVOID INCLUDING THE ENTIRE
// FHEVM MOCK LIB IN THE FINAL PRODUCTION BUNDLE!!
//
//////////////////////////////////////////////////////////////////////////

import { JsonRpcProvider } from "ethers";
import { FhevmInstance } from "../../fhevmTypes";

// Minimal fallback implementation when @fhevm/mock-utils is not available
const createMinimalLocalMockInstance = (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): FhevmInstance => {
  console.warn("[createMinimalLocalMockInstance] Using minimal fallback - FHE operations will not work");

  const provider = new JsonRpcProvider(parameters.rpcUrl);

  // Return a minimal FhevmInstance implementation
  return {
    // Minimal implementation - just enough to prevent crashes
    async encrypt8(value: number): Promise<`0x${string}`> {
      // Return a dummy encrypted handle
      return `0x${Math.random().toString(16).substring(2, 66)}` as `0x${string}`;
    },
    async encrypt16(value: number): Promise<`0x${string}`> {
      return `0x${Math.random().toString(16).substring(2, 66)}` as `0x${string}`;
    },
    async encrypt32(value: number): Promise<`0x${string}`> {
      return `0x${Math.random().toString(16).substring(2, 66)}` as `0x${string}`;
    },
    async decrypt(handle: `0x${string}`): Promise<number> {
      throw new Error("Decryption not supported in minimal fallback mode");
    },
    async reencrypt(
      handle: `0x${string}`,
      userAddress: `0x${string}`,
      signature: string
    ): Promise<string> {
      throw new Error("Reencryption not supported in minimal fallback mode");
    },
  } as unknown as FhevmInstance;
};

export const fhevmMockCreateInstance = async (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): Promise<FhevmInstance> => {
  try {
    // Try to use the real mock utils if available
    const { MockFhevmInstance } = await import("@fhevm/mock-utils");
    const provider = new JsonRpcProvider(parameters.rpcUrl);
    const instance = await MockFhevmInstance.create(provider, provider, {
      aclContractAddress: parameters.metadata.ACLAddress,
      chainId: parameters.chainId,
      gatewayChainId: 55815,
      inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
      kmsContractAddress: parameters.metadata.KMSVerifierAddress,
      verifyingContractAddressDecryption:
        "0x5ffdaAB0373E62E2ea2944776209aEf29E631A64",
      verifyingContractAddressInputVerification:
        "0x812b06e1CDCE800494b79fFE4f925A504a9A9810",
    });
    return instance;
  } catch (error) {
    console.warn("[fhevmMockCreateInstance] @fhevm/mock-utils not available, using fallback:", error);
    // Fallback to minimal implementation
    return createMinimalLocalMockInstance(parameters);
  }
};
