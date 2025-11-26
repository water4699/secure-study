// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Simplified Study Tracker Contract
/// @author secure-study
/// @notice A simplified learning time tracking contract for testing.
/// This version uses plain uint32 instead of FHE for easier testing.
contract EncryptedStudyTracker {
    // Simplified version using plain uint32 for testing
    mapping(address => uint32) private _totalStudyTime;
    mapping(address => uint32) private _dailyStudyTime;
    mapping(address => uint256) private _lastStudyDate;
    mapping(address => bool) private _totalTimeInitialized;
    mapping(address => bool) private _dailyTimeInitialized;

    // Events
    event StudyTimeRecorded(address indexed user, uint256 date);
    event StudyTimeDecrypted(address indexed user, uint32 decryptedTime, bool isDaily);
    event DebugState(address indexed user, bool dailyInitialized, bool totalInitialized, uint256 lastDate);
    event DebugRecordStart(address indexed user, uint256 currentDate, uint256 lastDate);
    event DebugRecordDaily(address indexed user, bool wasInitialized, bool isNewDay);
    event DebugRecordTotal(address indexed user, bool wasInitialized);
    event DebugGetDaily(address indexed user, bool isInitialized);
    event DebugGetTotal(address indexed user, bool isInitialized);
    event DebugFHEConversion(address indexed user, bool success);

    /// @notice Record daily study time for the user
    /// @param studyTimeEuint32 The encrypted study time in minutes (ignored in simplified version)
    /// @param inputProof The input proof (ignored in simplified version)
    /// @dev Adds the study time to both daily and total accumulated time
    function recordStudyTime(uint256 studyTimeEuint32, bytes calldata inputProof) external {
        emit DebugRecordStart(msg.sender, block.timestamp / 86400, _lastStudyDate[msg.sender]);

    // Use the actual study time passed from frontend
    uint32 studyTime = uint32(studyTimeEuint32);

        // Reset daily time if it's a new day
        uint256 currentDate = block.timestamp / 86400;

        if (_lastStudyDate[msg.sender] != currentDate) {
            emit DebugRecordDaily(msg.sender, _dailyTimeInitialized[msg.sender], true);
            _dailyStudyTime[msg.sender] = studyTime;
            _dailyTimeInitialized[msg.sender] = true;
            _lastStudyDate[msg.sender] = currentDate;
        } else {
            emit DebugRecordDaily(msg.sender, _dailyTimeInitialized[msg.sender], false);
            if (_dailyTimeInitialized[msg.sender]) {
                _dailyStudyTime[msg.sender] += studyTime;
            } else {
                _dailyStudyTime[msg.sender] = studyTime;
                _dailyTimeInitialized[msg.sender] = true;
            }
        }

        // Always add to total study time
        emit DebugRecordTotal(msg.sender, _totalTimeInitialized[msg.sender]);
        if (_totalTimeInitialized[msg.sender]) {
            _totalStudyTime[msg.sender] += studyTime;
        } else {
            _totalStudyTime[msg.sender] = studyTime;
            _totalTimeInitialized[msg.sender] = true;
        }

        // Final debug: Emit current state for troubleshooting
        emit DebugState(msg.sender, _dailyTimeInitialized[msg.sender], _totalTimeInitialized[msg.sender], _lastStudyDate[msg.sender]);

        emit StudyTimeRecorded(msg.sender, currentDate);
    }

    /// @notice Get the encrypted daily study time for a user
    /// @param user The address of the user
    /// @return The encrypted daily study time
    function getDailyStudyTime(address user) external view returns (uint32) {
        if (_dailyTimeInitialized[user]) {
            return _dailyStudyTime[user];
        } else {
            return 0;
        }
    }

    /// @notice Debug function to check daily study time initialization status
    /// @param user The address of the user
    /// @return True if daily study time has been initialized for the user
    function debugDailyInitialized(address user) external view returns (bool) {
        return _dailyTimeInitialized[user];
    }

    /// @notice Debug function to check total study time initialization status
    /// @param user The address of the user
    /// @return True if total study time has been initialized for the user
    function debugTotalInitialized(address user) external view returns (bool) {
        return _totalTimeInitialized[user];
    }

    /// @notice Debug function to get last study date
    /// @param user The address of the user
    /// @return The last study date for the user
    function debugLastStudyDate(address user) external view returns (uint256) {
        return _lastStudyDate[user];
    }

    /// @notice Get the encrypted total study time for a user
    /// @param user The address of the user
    /// @return The encrypted total study time
    function getTotalStudyTime(address user) external view returns (uint32) {
        if (_totalTimeInitialized[user]) {
            return _totalStudyTime[user];
        } else {
            return 0;
        }
    }

    /// @notice Get the last study date for a user
    /// @param user The address of the user
    /// @return The timestamp of the last study date
    function getLastStudyDate(address user) external view returns (uint256) {
        return _lastStudyDate[user];
    }

    /// @notice Get the current date (for UI purposes)
    /// @return The current date as days since epoch
    function getCurrentDate() external view returns (uint256) {
        return block.timestamp / 86400;
    }

    /// @notice Debug function to check current state
    /// @param user The address of the user
    /// @return dailyInit Whether daily time is initialized
    /// @return totalInit Whether total time is initialized
    /// @return lastDate Last study date
    function getDebugState(address user) external view returns (bool dailyInit, bool totalInit, uint256 lastDate) {
        return (_dailyTimeInitialized[user], _totalTimeInitialized[user], _lastStudyDate[user]);
    }

    /// @notice Request decryption of daily study time (creates transaction and popup)
    /// @param requestId A unique identifier for this decryption request
    /// @return The encrypted daily study time handle for client-side decryption
    function requestDecryptDaily(uint256 requestId) external returns (uint32) {
        require(_dailyTimeInitialized[msg.sender], "No daily study time recorded");

        // Emit event to record the decryption request (this creates a transaction)
        emit StudyTimeDecrypted(msg.sender, _dailyStudyTime[msg.sender], true);

        // Return the plain value for client-side decryption
        return _dailyStudyTime[msg.sender];
    }

    /// @notice Request decryption of total study time (creates transaction and popup)
    /// @param requestId A unique identifier for this decryption request
    /// @return The encrypted total study time handle for client-side decryption
    function requestDecryptTotal(uint256 requestId) external returns (uint32) {
        require(_totalTimeInitialized[msg.sender], "No total study time recorded");

        // Emit event to record the decryption request (this creates a transaction)
        emit StudyTimeDecrypted(msg.sender, _totalStudyTime[msg.sender], false);

        // Return the plain value for client-side decryption
        return _totalStudyTime[msg.sender];
    }
}
