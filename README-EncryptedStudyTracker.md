# Encrypted Study Tracker

A privacy-preserving learning time tracking application built with FHEVM (Fully Homomorphic Encryption Virtual Machine) and Zama's fhEVM technology.

## Overview

The Encrypted Study Tracker allows users to record their daily study time in encrypted form. The application uses FHEVM to perform computations on encrypted data, enabling privacy-preserving accumulation of study time across sessions while maintaining confidentiality.

### Key Features

- **Privacy-Preserving**: Study time is recorded and computed in encrypted form
- **Daily Tracking**: Tracks daily study sessions with automatic date-based resets
- **Total Accumulation**: Maintains encrypted running total of all study time
- **On-Chain Decryption**: Users can decrypt their study time statistics on-demand
- **Multi-User Support**: Each user maintains separate encrypted records
- **Rainbow Wallet Integration**: Easy wallet connection via RainbowKit

### Technical Architecture

- **Smart Contract**: `EncryptedStudyTracker.sol` - FHEVM-compatible Solidity contract
- **Frontend**: Next.js application with React hooks for contract interaction
- **Encryption**: Zama's fhEVM for fully homomorphic encryption operations
- **Wallet**: RainbowKit for seamless wallet connection
- **Network**: Compatible with local Hardhat node and Sepolia testnet

## Quick Start

### Prerequisites

- Node.js >= 20
- npm >= 7

### Installation & Setup

1. **Clone and install dependencies:**
   ```bash
   cd secure-study
   npm install
   cd frontend
   npm install
   cd ..
   ```

2. **Start the development environment:**
   ```bash
   # Start Hardhat node (in one terminal)
   npx hardhat node

   # Deploy contracts (in another terminal)
   npx hardhat deploy --network localhost

   # Generate ABI files
   cd frontend
   node scripts/genabi.mjs
   cd ..

   # Start frontend
   cd frontend
   npm run dev
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Hardhat Node: http://localhost:8545

### Alternative Quick Start (Windows)

Run the PowerShell script:
```powershell
.\start-project.ps1
```

## Usage

### Recording Study Time

1. Connect your wallet using the Rainbow button in the top-right corner
2. Enter the number of minutes you studied today
3. Click "Record Study Time" to submit encrypted study time to the blockchain

### Viewing Statistics

- **Daily Time**: View today's accumulated study time
- **Total Time**: View your all-time study time total
- Click "Decrypt" buttons to reveal the actual time values

### Contract Interaction via CLI

The project includes Hardhat tasks for direct contract interaction:

```bash
# Get contract address
npx hardhat --network localhost task:study-address

# Record study time (30 minutes)
npx hardhat --network localhost task:study-record --minutes 30

# Decrypt daily study time
npx hardhat --network localhost task:study-decrypt-daily

# Decrypt total study time
npx hardhat --network localhost task:study-decrypt-total

# Show current study information
npx hardhat --network localhost task:study-info
```

## Project Structure

```
secure-study/
├── contracts/                 # Solidity smart contracts
│   ├── EncryptedStudyTracker.sol
│   └── FHECounter.sol
├── frontend/                  # Next.js frontend application
│   ├── app/                   # Next.js app directory
│   ├── components/            # React components
│   ├── hooks/                 # Custom React hooks
│   ├── fhevm/                 # FHEVM utilities and types
│   └── abi/                   # Generated ABI files
├── test/                      # Hardhat tests
├── tasks/                     # Hardhat tasks
├── deployments/               # Contract deployment artifacts
└── types/                     # TypeScript type definitions
```

## Smart Contract API

### EncryptedStudyTracker.sol

#### Functions

- `recordStudyTime(externalEuint32 studyTimeEuint32, bytes calldata inputProof)`: Record encrypted study time
- `getDailyStudyTime() returns (euint32)`: Get encrypted daily study time
- `getTotalStudyTime() returns (euint32)`: Get encrypted total study time
- `getLastStudyDate() returns (uint256)`: Get last study date timestamp
- `getCurrentDate() returns (uint256)`: Get current date as days since epoch

#### Events

- `StudyTimeRecorded(address indexed user, uint256 date)`: Emitted when study time is recorded

## Testing

### Local Testing

```bash
# Run all tests
npx hardhat test

# Run specific test file
npx hardhat test --grep "EncryptedStudyTracker"
```

### Sepolia Testing

```bash
# Deploy to Sepolia
npx hardhat deploy --network sepolia

# Run Sepolia tests
npx hardhat test --grep "Sepolia" --network sepolia
```

## Deployment

### Local Network

```bash
npx hardhat deploy --network localhost
```

### Sepolia Testnet

1. Set up environment variables:
   ```bash
   npx hardhat vars setup
   ```

2. Deploy:
   ```bash
   npx hardhat deploy --network sepolia
   ```

## FHEVM Configuration

The project uses Zama's fhEVM for homomorphic encryption. Key configurations:

- **Network**: Supports both local Hardhat and Sepolia testnet
- **Encryption**: euint32 for time values (minutes)
- **Operations**: Addition for accumulating study time
- **Decryption**: User-controlled decryption with signature verification

## Security Considerations

- All study time data is encrypted on-chain
- Users control their own decryption keys
- Contract uses FHEVM for privacy-preserving computations
- Rainbow wallet integration ensures secure key management

## Development

### Adding New Features

1. Update the smart contract in `contracts/EncryptedStudyTracker.sol`
2. Regenerate types: `npx hardhat typechain`
3. Update frontend hooks in `frontend/hooks/useEncryptedStudyTracker.tsx`
4. Add UI components in `frontend/components/`
5. Update tests in `test/EncryptedStudyTracker.ts`

### Code Style

- Use ESLint and Prettier for code formatting
- Follow Solidity style guide for smart contracts
- Use TypeScript for all frontend code

## Troubleshooting

### Common Issues

1. **Hardhat node not starting**: Ensure port 8545 is available
2. **Contract deployment fails**: Check network connection and gas limits
3. **Frontend not loading**: Ensure all dependencies are installed
4. **Decryption fails**: Verify FHEVM instance is properly initialized

### Logs and Debugging

- Hardhat logs: Check console output during deployment/testing
- Frontend logs: Open browser developer tools
- Contract events: Use blockchain explorers or Hardhat logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the BSD-3-Clause-Clear license.

## Acknowledgments

- Built with [Zama's fhEVM](https://www.zama.ai/fhevm)
- Frontend powered by [Next.js](https://nextjs.org/)
- Wallet integration via [RainbowKit](https://rainbowkit.com/)
