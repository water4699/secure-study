# Encrypted Study Tracker

A privacy-preserving learning time tracking application built with FHEVM (Fully Homomorphic Encryption Virtual Machine) technology. Users can record their daily study time in encrypted form, and view both daily and total accumulated study time through secure decryption.

## Features

- **Privacy-Preserving**: Study time data is encrypted using FHEVM, ensuring user privacy
- **Encrypted Operations**: Time accumulation happens in encrypted form using homomorphic addition
- **Secure Decryption**: Users can decrypt their own study time data securely
- **Multi-User Support**: Each user's data is kept separate and private
- **Modern UI**: Built with Next.js, React, and Tailwind CSS
- **Wallet Integration**: RainbowKit wallet integration for easy connection

## Architecture

### Smart Contracts
- `EncryptedStudyTracker.sol`: Main contract handling encrypted study time recording and decryption
- Uses FHEVM for fully homomorphic encryption operations

### Frontend
- Built with Next.js 15 and React 19
- RainbowKit for wallet connection
- Custom hooks for FHEVM operations
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js >= 20
- npm >= 7.0.0
- A compatible Ethereum wallet (MetaMask, etc.)

## Quick Start

### 1. Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 2. Start Local Development Environment

```bash
# Start local Hardhat node (in one terminal)
npm run local-node

# In another terminal, deploy contracts
npm run deploy-local

# Start frontend development server (in another terminal)
npm run frontend-dev
```

### 3. Access the Application

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Connect Wallet and Test

1. Click "Connect to MetaMask" to connect your wallet
2. Enter study time in minutes and click "Record Study Time"
3. Click "Decrypt Daily Time" or "Decrypt Total Time" to view your study data

## Available Scripts

### Backend Scripts

```bash
# Clean build artifacts
npm run clean

# Compile contracts
npm run compile

# Run tests on local network
npm run test

# Run tests on Sepolia testnet
npm run test:sepolia

# Start local Hardhat node
npm run local-node

# Deploy contracts to local network
npm run deploy-local

# Deploy contracts to Sepolia
npm run deploy-sepolia
```

### Frontend Scripts

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Generate ABI files
npm run genabi

# Lint code
npm run lint
```

## Testing

### Local Testing

```bash
# Run all tests
npm run test

# Run specific test file
npx hardhat test test/EncryptedStudyTracker.ts

# Run Sepolia tests
npm run test:sepolia
```

### Manual Testing Tasks

```bash
# Record study time
npx hardhat --network localhost task:study-record --minutes 30

# Decrypt daily study time
npx hardhat --network localhost task:study-decrypt-daily

# Decrypt total study time
npx hardhat --network localhost task:study-decrypt-total

# Show study information
npx hardhat --network localhost task:study-info
```

## Contract Addresses

### Local Network (Hardhat)
- EncryptedStudyTracker: Check `deployments/localhost/EncryptedStudyTracker.json`

### Sepolia Testnet
- EncryptedStudyTracker: Check `deployments/sepolia/EncryptedStudyTracker.json` (after deployment)

## How It Works

1. **Recording Study Time**:
   - User enters study time in minutes
   - Time is encrypted using FHEVM before sending to contract
   - Contract stores encrypted daily and total study time

2. **Time Accumulation**:
   - Daily time resets each day (based on block timestamp)
   - Total time accumulates all study sessions
   - All operations happen in encrypted form

3. **Viewing Study Data**:
   - Users can decrypt their own study time data
   - Decryption happens client-side using FHEVM
   - Only the user can see their decrypted data

## Security Features

- **Fully Homomorphic Encryption**: All computations happen on encrypted data
- **User Isolation**: Each user's data is completely separate
- **Client-Side Decryption**: Users decrypt their own data locally
- **Zero-Knowledge**: Contract cannot see actual study time values

## Development

### Project Structure

```
secure-study/
├── contracts/              # Solidity contracts
├── test/                   # Contract tests
├── tasks/                  # Hardhat tasks
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── abi/               # Generated ABI files
│   └── fhevm/             # FHEVM utilities
├── deployments/           # Deployment artifacts
└── types/                 # TypeScript types
```

### Adding New Features

1. Modify contracts in the `contracts/` directory
2. Update tests in the `test/` directory
3. Regenerate types: `npm run typechain`
4. Update frontend hooks and components as needed
5. Regenerate ABI: `cd frontend && npm run genabi`

## Deployment

### Local Deployment

```bash
# Start local node
npm run local-node

# Deploy contracts
npm run deploy-local
```

### Testnet Deployment

```bash
# Set up environment variables in .env
# INFURA_API_KEY=your_infura_key
# MNEMONIC=your_wallet_mnemonic
# ETHERSCAN_API_KEY=your_etherscan_key

# Deploy to Sepolia
npm run deploy-sepolia
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

BSD-3-Clause-Clear License

## Acknowledgments

- Built with [FHEVM](https://docs.zama.ai/fhevm) by Zama
- Frontend template based on [fhevm-react-template](https://github.com/zama-ai/fhevm-react-template)
- Wallet integration using [RainbowKit](https://rainbowkit.com)