# Wisentia NFT System with IPFS and Blockchain Integration

This module integrates IPFS (using Pinata) and blockchain functionality for the Wisentia educational platform NFT system.

## Overview

The NFT system in Wisentia now supports:
- Storing NFT metadata and images on IPFS via Pinata
- Minting NFTs on the blockchain
- Managing NFT lifecycle including creation, minting, and trading
- Standard NFT metadata format with attributes

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env` file:

```
# Pinata API Credentials
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt

# Blockchain Settings
BLOCKCHAIN_NETWORK=educhain  # Options: educhain, ethereum, polygon
WISENTIA_CONTRACT_ADDRESS=0x8ad8deeaa340d88f1a5a3ed69c3f0bbdc2482699
ADMIN_WALLET_ADDRESS=your_admin_wallet_address
ADMIN_WALLET_PRIVATE_KEY=your_admin_wallet_private_key
```

### 2. Database Update

Ensure your database has the required columns for blockchain integration:

```sql
-- Check if columns exist and add if missing
IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = 'BlockchainNFTID' AND Object_ID = Object_ID('UserNFTs'))
BEGIN
    ALTER TABLE UserNFTs ADD BlockchainNFTID INT NULL;
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = 'IsTraded' AND Object_ID = Object_ID('UserNFTs'))
BEGIN
    ALTER TABLE UserNFTs ADD IsTraded BIT DEFAULT 0;
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = 'TradeDate' AND Object_ID = Object_ID('UserNFTs'))
BEGIN
    ALTER TABLE UserNFTs ADD TradeDate DATETIME NULL;
END

IF NOT EXISTS(SELECT * FROM sys.columns WHERE Name = 'TradeTransactionHash' AND Object_ID = Object_ID('UserNFTs'))
BEGIN
    ALTER TABLE UserNFTs ADD TradeTransactionHash NVARCHAR(100) NULL;
END
```

## API Endpoints

### NFT Creation and Minting

- **Create NFT**: `POST /api/nfts/create/`
  - Admin only
  - Creates NFT with metadata stored on IPFS
  - Required fields: title, description, imageUri, nftTypeId
  - Optional fields: tradeValue, subscriptionDays, attributes

- **Mint NFT**: `POST /api/nfts/mint/{user_nft_id}/`
  - Mints an existing NFT to the blockchain
  - Required field: walletAddress
  - Optional field: transactionHash (if minting was done externally)

### NFT Metadata

- **Get NFT Metadata**: `GET /api/nfts/{nft_id}/metadata/`
  - Returns IPFS metadata URI and blockchain information for an NFT

## NFT Service

The `NFTService` class provides methods for working with NFTs:

- `mint_nft`: Mint an existing NFT to the blockchain with IPFS metadata
- `create_nft_with_metadata`: Create a new NFT with metadata stored on IPFS

## IPFS Service

The `IPFSService` class handles interaction with IPFS via Pinata:

- `upload_metadata`: Upload NFT metadata to IPFS
- `upload_image`: Upload an image file to IPFS
- `create_nft_metadata`: Create standard NFT metadata format

## NFT Metadata Format

NFTs use the standard metadata format:

```json
{
  "name": "NFT Title",
  "description": "NFT Description",
  "image": "ipfs://QmImageHash",
  "attributes": [
    {
      "trait_type": "Type",
      "value": "subscription"
    },
    {
      "trait_type": "Subscription Tier",
      "value": "Premium"
    },
    {
      "trait_type": "Subscription Length",
      "value": "30 days"
    },
    {
      "trait_type": "Tradable",
      "value": "Yes"
    },
    {
      "trait_type": "Trade Value",
      "value": 150
    }
  ],
  "external_url": "https://wisentia.com/nfts/123"
}
```

## Gas Optimization for Testnet

For testing on Educhain testnet, gas costs are minimized:
- Gas price is set to 50 gwei
- Gas limit is set to 2,000,000
- Transactions are batched where possible 