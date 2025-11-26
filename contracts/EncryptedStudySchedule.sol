// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {FHE, euint32, externalEuint32} from "@fhevm/solidity/lib/FHE.sol";
import {EthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

/// @title Encrypted Study Schedule Contract
/// @author time-lock
/// @notice A privacy-preserving study schedule tracking contract using FHEVM.
/// Users can record their daily learning goals, completed tasks, and priorities in encrypted form.
/// Only the user can decrypt their own data to view completion rate and average priority.
contract EncryptedStudySchedule is EthereumConfig {
    // Mapping of user address to their encrypted goal count (number of tasks)
    mapping(address => euint32) private _goalCount;
    
    // Mapping of user address to their encrypted completed count
    mapping(address => euint32) private _completedCount;
    
    // Mapping of user address to their encrypted priority sum (for calculating average)
    mapping(address => euint32) private _prioritySum;
    
    // Mapping of user address to their encrypted task count (for calculating average priority)
    mapping(address => euint32) private _taskCount;
    
    // Mapping of user address to their last update date (timestamp)
    mapping(address => uint256) private _lastUpdateDate;
    
    // Mapping to track if data has been initialized for each user
    mapping(address => bool) private _initialized;
    
    // Events
    event StudyScheduleUpdated(address indexed user, uint256 date);
    event ScheduleDecrypted(address indexed user, uint32 goalCount, uint32 completedCount, uint32 completionRate, uint32 avgPriority);
    
    /// @notice Record or update study schedule for the user
    /// @param goalCountEuint32 The encrypted goal count (number of tasks) (euint32)
    /// @param goalCountProof The input proof for goal count
    /// @param completedCountEuint32 The encrypted completed count (euint32)
    /// @param completedCountProof The input proof for completed count
    /// @param priorityEuint32 The encrypted priority (1-3) (euint32)
    /// @param priorityProof The input proof for priority
    /// @dev Resets daily data if it's a new day, otherwise updates existing data
    function updateStudySchedule(
        externalEuint32 goalCountEuint32,
        bytes calldata goalCountProof,
        externalEuint32 completedCountEuint32,
        bytes calldata completedCountProof,
        externalEuint32 priorityEuint32,
        bytes calldata priorityProof
    ) external {
        euint32 encryptedGoalCount = FHE.fromExternal(goalCountEuint32, goalCountProof);
        euint32 encryptedCompletedCount = FHE.fromExternal(completedCountEuint32, completedCountProof);
        euint32 encryptedPriority = FHE.fromExternal(priorityEuint32, priorityProof);
        
        // Check if priority is within valid range (1-3)
        // Note: In production, this should be done client-side before encryption
        // For encrypted validation, we can use FHE comparison operations
        
        // Reset daily data if it's a new day
        uint256 currentDate = block.timestamp / 86400; // Convert to days
        if (_lastUpdateDate[msg.sender] != currentDate) {
            _goalCount[msg.sender] = encryptedGoalCount;
            _completedCount[msg.sender] = encryptedCompletedCount;
            _prioritySum[msg.sender] = encryptedPriority;
            _taskCount[msg.sender] = FHE.asEuint32(1); // One task
            _lastUpdateDate[msg.sender] = currentDate;
            _initialized[msg.sender] = true;
        } else {
            // Update existing data for the same day
            if (_initialized[msg.sender]) {
                // Add to existing goal count
                _goalCount[msg.sender] = FHE.add(_goalCount[msg.sender], encryptedGoalCount);
                // Add to existing completed count
                _completedCount[msg.sender] = FHE.add(_completedCount[msg.sender], encryptedCompletedCount);
                // Add to priority sum
                _prioritySum[msg.sender] = FHE.add(_prioritySum[msg.sender], encryptedPriority);
                // Increment task count
                _taskCount[msg.sender] = FHE.add(_taskCount[msg.sender], FHE.asEuint32(1));
            } else {
                _goalCount[msg.sender] = encryptedGoalCount;
                _completedCount[msg.sender] = encryptedCompletedCount;
                _prioritySum[msg.sender] = encryptedPriority;
                _taskCount[msg.sender] = FHE.asEuint32(1);
                _initialized[msg.sender] = true;
            }
        }
        
        // Allow the contract and user to access the encrypted values
        FHE.allowThis(_goalCount[msg.sender]);
        FHE.allowThis(_completedCount[msg.sender]);
        FHE.allowThis(_prioritySum[msg.sender]);
        FHE.allowThis(_taskCount[msg.sender]);
        
        // Only allow the user to decrypt their own data
        FHE.allow(_goalCount[msg.sender], msg.sender);
        FHE.allow(_completedCount[msg.sender], msg.sender);
        FHE.allow(_prioritySum[msg.sender], msg.sender);
        FHE.allow(_taskCount[msg.sender], msg.sender);
        
        emit StudyScheduleUpdated(msg.sender, currentDate);
    }
    
    /// @notice Get the encrypted goal count for the caller
    /// @return The encrypted goal count
    function getGoalCount() external view returns (euint32) {
        if (_initialized[msg.sender]) {
            return _goalCount[msg.sender];
        } else {
            return euint32.wrap(0);
        }
    }
    
    /// @notice Get the encrypted completed count for the caller
    /// @return The encrypted completed count
    function getCompletedCount() external view returns (euint32) {
        if (_initialized[msg.sender]) {
            return _completedCount[msg.sender];
        } else {
            return euint32.wrap(0);
        }
    }
    
    /// @notice Get the encrypted priority sum for the caller
    /// @return The encrypted priority sum
    function getPrioritySum() external view returns (euint32) {
        if (_initialized[msg.sender]) {
            return _prioritySum[msg.sender];
        } else {
            return euint32.wrap(0);
        }
    }
    
    /// @notice Get the encrypted task count for the caller
    /// @return The encrypted task count
    function getTaskCount() external view returns (euint32) {
        if (_initialized[msg.sender]) {
            return _taskCount[msg.sender];
        } else {
            return euint32.wrap(0);
        }
    }
    
    /// @notice Calculate encrypted completion rate numerator (completed * 100)
    /// @return The encrypted completion rate numerator (completed * 100)
    /// @dev Client should divide by goal count after decryption to get percentage
    /// FHE division requires plaintext divisor, so we return the numerator for client-side calculation
    function getCompletionRateNumerator() external returns (euint32) {
        if (!_initialized[msg.sender]) {
            return euint32.wrap(0);
        }
        
        euint32 completed = _completedCount[msg.sender];
        
        // Multiply completed by 100 for percentage calculation
        euint32 completedTimes100 = FHE.mul(completed, FHE.asEuint32(100));
        
        // Allow user to decrypt
        FHE.allowThis(completedTimes100);
        FHE.allow(completedTimes100, msg.sender);
        
        return completedTimes100;
    }
    
    /// @notice Get encrypted values needed for client-side calculation
    /// @return goalCount The encrypted goal count
    /// @return completedCount The encrypted completed count  
    /// @return prioritySum The encrypted priority sum
    /// @return taskCount The encrypted task count
    /// @dev Client can decrypt these and calculate completion rate and average priority
    function getScheduleData() external view returns (
        euint32 goalCount,
        euint32 completedCount,
        euint32 prioritySum,
        euint32 taskCount
    ) {
        if (!_initialized[msg.sender]) {
            return (euint32.wrap(0), euint32.wrap(0), euint32.wrap(0), euint32.wrap(0));
        }
        
        return (_goalCount[msg.sender], _completedCount[msg.sender], _prioritySum[msg.sender], _taskCount[msg.sender]);
    }
    
    /// @notice Get the last update date for the caller
    /// @return The timestamp of the last update date
    function getLastUpdateDate() external view returns (uint256) {
        return _lastUpdateDate[msg.sender];
    }
    
    /// @notice Get the current date (for UI purposes)
    /// @return The current date as days since epoch
    function getCurrentDate() external view returns (uint256) {
        return block.timestamp / 86400;
    }
    
    /// @notice Request decryption of study schedule data (creates transaction and popup)
    /// @param requestId A unique identifier for this decryption request
    /// @return goalCount The encrypted goal count handle
    /// @return completedCount The encrypted completed count handle
    /// @return prioritySum The encrypted priority sum handle
    /// @return taskCount The encrypted task count handle
    function requestDecryptSchedule(uint256 requestId) external returns (
        euint32 goalCount,
        euint32 completedCount,
        euint32 prioritySum,
        euint32 taskCount
    ) {
        require(_initialized[msg.sender], "No study schedule recorded");
        
        // Emit event to record the decryption request
        emit ScheduleDecrypted(msg.sender, 0, 0, 0, 0);
        
        // Return the encrypted handles for client-side decryption
        goalCount = _goalCount[msg.sender];
        completedCount = _completedCount[msg.sender];
        prioritySum = _prioritySum[msg.sender];
        taskCount = _taskCount[msg.sender];
    }
}

