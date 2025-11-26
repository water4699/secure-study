"use client";

import { useState, useMemo } from "react";
import { ethers } from "ethers";
import { useFhevm } from "../fhevm/useFhevm";
import { useInMemoryStorage } from "../hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "../hooks/metamask/useMetaMaskEthersSigner";
import { useEncryptedStudyTracker } from "../hooks/useEncryptedStudyTracker";
import { errorNotDeployed } from "./ErrorNotDeployed";

export const EncryptedStudyTrackerDemo = () => {
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const fhevmProvider = useMemo(
    () => (chainId === 31337 ? "http://localhost:8545" : provider),
    [chainId, provider]
  );

  const fhevmReadonlyProvider = useMemo(
    () =>
      chainId === 31337
        ? new ethers.JsonRpcProvider("http://localhost:8545")
        : ethersReadonlyProvider,
    [chainId, ethersReadonlyProvider]
  );

  const [studyTimeInput, setStudyTimeInput] = useState<string>("30");
  const [showDebugInfo, setShowDebugInfo] = useState<boolean>(false);

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider: fhevmProvider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const studyTracker = useEncryptedStudyTracker({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider: fhevmReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const handleRecordStudyTime = () => {
    const minutes = parseInt(studyTimeInput);
    if (minutes > 0) {
      studyTracker.recordStudyTime(minutes);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8">
        <div className="text-center space-y-4 max-w-2xl">
          <h2 className="text-4xl font-bold text-gray-800">Welcome to Encrypted Study Tracker</h2>
          <p className="text-gray-600 text-xl">
            Privacy-preserving learning time tracking with FHEVM
          </p>
        </div>
        <button
          className="btn-primary inline-flex items-center justify-center rounded-xl px-10 py-5 font-semibold text-white shadow-lg text-xl hover:shadow-xl transition-shadow"
          onClick={connect}
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (studyTracker.isDeployed === false) {
    return errorNotDeployed(chainId);
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 px-4 md:px-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">
          Encrypted Study Tracker
        </h1>
        <p className="text-slate-300 text-sm md:text-base">
          Track your learning time with fully homomorphic encryption
        </p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Actions */}
        <div className="lg:col-span-2 space-y-6">
          {/* Record Study Time Card */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xl">📝</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800">Record Study Time</h2>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={studyTimeInput}
                  onChange={(e) => setStudyTimeInput(e.target.value)}
                  className="w-full rounded-xl border-2 border-gray-200 px-4 py-3 text-lg font-medium text-gray-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                  placeholder="Enter minutes"
                />
              </div>
              <button
                className="btn-primary rounded-xl px-6 py-3 font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                disabled={!studyTracker.canRecordStudyTime}
                onClick={handleRecordStudyTime}
              >
                {studyTracker.isRecording ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Recording...
                  </span>
                ) : (
                  `Record ${studyTimeInput} min`
                )}
              </button>
            </div>
          </div>

          {/* Study Time Display Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Study Time */}
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <span className="text-white text-xl">📅</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Daily Study Time</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Encrypted</span>
                    <span className="text-2xl">🔒</span>
                  </div>
                  <p className="text-sm text-gray-500 font-mono">
                    {studyTracker.dailyHandle && studyTracker.dailyHandle !== "0"
                      ? "[ENCRYPTED_FHE_HANDLE_DAILY]"
                      : "No data"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Decrypted</span>
                    {studyTracker.isDailyDecrypted && (
                      <span className="text-2xl">✅</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {studyTracker.isDailyDecrypted
                      ? `${studyTracker.clearDailyTime} min`
                      : "—"}
                  </p>
                </div>
                <button
                  className="btn-primary w-full rounded-xl px-4 py-3 font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!studyTracker.canDecryptDaily}
                  onClick={studyTracker.decryptDailyStudyTime}
                >
                  {studyTracker.isDecryptingDaily ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Decrypting...
                    </span>
                  ) : studyTracker.isDailyDecrypted ? (
                    "Decrypted ✓"
                  ) : (
                    "Decrypt Daily Time"
                  )}
                </button>
              </div>
            </div>

            {/* Total Study Time */}
            <div className="bg-white rounded-2xl p-6 card-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                  <span className="text-white text-xl">📊</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Total Study Time</h3>
              </div>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Encrypted</span>
                    <span className="text-2xl">🔒</span>
                  </div>
                  <p className="text-sm text-gray-500 font-mono">
                    {studyTracker.totalHandle && studyTracker.totalHandle !== "0"
                      ? "[ENCRYPTED_FHE_HANDLE_TOTAL]"
                      : "No data"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Decrypted</span>
                    {studyTracker.isTotalDecrypted && (
                      <span className="text-2xl">✅</span>
                    )}
                  </div>
                  <p className="text-2xl font-bold text-gray-800">
                    {studyTracker.isTotalDecrypted
                      ? `${studyTracker.clearTotalTime} min`
                      : "—"}
                  </p>
                </div>
                <button
                  className="btn-primary w-full rounded-xl px-4 py-3 font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!studyTracker.canDecryptTotal}
                  onClick={studyTracker.decryptTotalStudyTime}
                >
                  {studyTracker.isDecryptingTotal ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Decrypting...
                    </span>
                  ) : studyTracker.isTotalDecrypted ? (
                    "Decrypted ✓"
                  ) : (
                    "Decrypt Total Time"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Refresh Button */}
          <button
            className="btn-primary w-full rounded-xl px-6 py-4 font-semibold text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!studyTracker.canGetStudyTimes}
            onClick={studyTracker.refreshStudyTimes}
          >
            {studyTracker.isRefreshing ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Refreshing...
              </span>
            ) : (
              "🔄 Refresh Study Times"
            )}
          </button>
        </div>

        {/* Right Column - Status & Debug */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-2xl p-6 card-shadow">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Status</h3>
            <div className="space-y-3">
              <StatusItem
                label="FHEVM"
                value={fhevmInstance ? "Connected" : "Disconnected"}
                isGood={!!fhevmInstance}
              />
              <StatusItem
                label="Contract"
                value={studyTracker.isDeployed ? "Deployed" : "Not Deployed"}
                isGood={!!studyTracker.isDeployed}
              />
              <StatusItem
                label="Network"
                value={`Chain ${chainId}`}
                isGood={true}
              />
            </div>
          </div>

          {/* Message Card */}
          {studyTracker.message && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 slide-in">
              <p className="text-sm text-blue-800">{studyTracker.message}</p>
            </div>
          )}

          {/* Debug Toggle */}
          <button
            onClick={() => setShowDebugInfo(!showDebugInfo)}
            className="w-full text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {showDebugInfo ? "Hide" : "Show"} Debug Info
          </button>

          {/* Debug Info */}
          {showDebugInfo && (
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
              <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                Debug Information
              </h3>
              <div className="space-y-2 text-xs">
                <DebugItem label="ChainId" value={chainId} />
                <DebugItem
                  label="Signer"
                  value={
                    ethersSigner
                      ? `${ethersSigner.address.slice(0, 6)}...${ethersSigner.address.slice(-4)}`
                      : "No signer"
                  }
                />
                <DebugItem
                  label="Contract"
                  value={
                    studyTracker.contractAddress
                      ? `${studyTracker.contractAddress.slice(0, 6)}...${studyTracker.contractAddress.slice(-4)}`
                      : "Not deployed"
                  }
                />
                <DebugItem label="FHEVM Status" value={fhevmStatus} />
                <DebugItem
                  label="FHEVM Error"
                  value={fhevmError?.message || "No error"}
                />
                <DebugItem label="isRefreshing" value={studyTracker.isRefreshing} />
                <DebugItem label="isRecording" value={studyTracker.isRecording} />
                <DebugItem
                  label="isDecryptingDaily"
                  value={studyTracker.isDecryptingDaily}
                />
                <DebugItem
                  label="isDecryptingTotal"
                  value={studyTracker.isDecryptingTotal}
                />
                <DebugItem
                  label="canDecryptDaily"
                  value={studyTracker.canDecryptDaily}
                />
                <DebugItem
                  label="canDecryptTotal"
                  value={studyTracker.canDecryptTotal}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

function StatusItem({
  label,
  value,
  isGood,
}: {
  label: string;
  value: string;
  isGood: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${
            isGood ? "bg-green-500" : "bg-red-500"
          }`}
        ></div>
        <span className="text-sm font-medium text-gray-800">{value}</span>
      </div>
    </div>
  );
}

function DebugItem({ label, value }: { label: string; value: unknown }) {
  const displayValue =
    typeof value === "boolean"
      ? value
        ? "true"
        : "false"
      : typeof value === "string" || typeof value === "number"
      ? String(value)
      : value === null || value === undefined
      ? String(value)
      : JSON.stringify(value);

  return (
    <div className="flex justify-between">
      <span className="text-gray-600 font-mono">{label}:</span>
      <span className="text-gray-800 font-mono font-semibold">{displayValue}</span>
    </div>
  );
}
