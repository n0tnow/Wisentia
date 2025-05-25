import json
import os
import logging
from web3 import Web3
from web3.exceptions import ContractLogicError
from django.conf import settings

logger = logging.getLogger('wisentia')

# Contract address from deployment output or settings
WISENTIA_CONTRACT_ADDRESS = getattr(settings, 'WISENTIA_CONTRACT_ADDRESS', "0x8ad8deeaa340d88f1a5a3ed69c3f0bbdc2482699")

def get_web3_connection(network="educhain"):
    """Return a Web3 instance connected to the specified network"""
    if network == "educhain":
        # Connect to Educhain testnet RPC
        rpc_url = getattr(settings, 'EDUCHAIN_RPC_URL', "https://rpctest.educhain.io")
        web3 = Web3(Web3.HTTPProvider(rpc_url))
    elif network == "development":
        # Connect to local development blockchain (Ganache/Hardhat)
        rpc_url = "http://localhost:8545"
        web3 = Web3(Web3.HTTPProvider(rpc_url))
    else:
        # Default to Educhain testnet
        rpc_url = getattr(settings, 'EDUCHAIN_RPC_URL', "https://rpctest.educhain.io")
        web3 = Web3(Web3.HTTPProvider(rpc_url))
    
    if not web3.is_connected():
        logger.error(f"Failed to connect to {network}")
        raise ConnectionError(f"Failed to connect to {network}")
    
    return web3

# Contract ABI - simplified version with just what we need
WISENTIA_CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "address",
                "name": "a",
                "type": "address"
            },
            {
                "indexed": False,
                "internalType": "bool",
                "name": "v",
                "type": "bool"
            }
        ],
        "name": "AA",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "a",
                "type": "uint256"
            }
        ],
        "name": "FW",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "address",
                "name": "f",
                "type": "address"
            },
            {
                "indexed": False,
                "internalType": "uint256[]",
                "name": "ids",
                "type": "uint256[]"
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "n",
                "type": "uint256"
            }
        ],
        "name": "NT",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": True,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "address",
                "name": "u",
                "type": "address"
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": False,
                "internalType": "string",
                "name": "t",
                "type": "string"
            }
        ],
        "name": "RM",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "address",
                "name": "u",
                "type": "address"
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            }
        ],
        "name": "SC",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "address",
                "name": "u",
                "type": "address"
            },
            {
                "indexed": False,
                "internalType": "uint8",
                "name": "t",
                "type": "uint8"
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "e",
                "type": "uint256"
            }
        ],
        "name": "SP",
        "type": "event"
    },
    {
        "anonymous": False,
        "inputs": [
            {
                "indexed": True,
                "internalType": "address",
                "name": "u",
                "type": "address"
            },
            {
                "indexed": False,
                "internalType": "uint8",
                "name": "t",
                "type": "uint8"
            },
            {
                "indexed": False,
                "internalType": "uint256",
                "name": "e",
                "type": "uint256"
            }
        ],
        "name": "SR",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "a",
                "type": "address"
            }
        ],
        "name": "aa",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

# Function signature for ERC-721 safeTransferFrom
ERC721_TRANSFER_SIGNATURE = "0x42842e0e"

def create_erc721_transfer_data(contract_address, to_address, token_id):
    """Create ERC-721 safeTransferFrom function data for NFT transfer
    
    Args:
        contract_address (str): The NFT contract address 
        to_address (str): The address receiving the NFT
        token_id (int): The token ID of the NFT
        
    Returns:
        str: Hex-encoded transaction data string
    """
    from web3 import Web3
    
    # Remove '0x' prefix if present
    contract_address = contract_address[2:] if contract_address.startswith('0x') else contract_address
    to_address = to_address[2:] if to_address.startswith('0x') else to_address
    
    # Ensure addresses are padded to 32 bytes (64 hex chars)
    contract_address_padded = contract_address.lower().zfill(64)
    to_address_padded = to_address.lower().zfill(64)
    
    # Convert token_id to hex and pad to 32 bytes
    token_id_hex = hex(token_id)[2:].zfill(64)
    
    # Construct the data field for ERC-721 token transfer
    # This uses the ERC-721 standard method signature for transferring tokens
    data = f"{ERC721_TRANSFER_SIGNATURE}000000000000000000000000{contract_address_padded}000000000000000000000000{to_address_padded}{token_id_hex}"
    
    return data

class BlockchainService:
    """WisentiaCore akıllı sözleşmesiyle etkileşim için servis sınıfı"""
    
    def __init__(self, network="educhain"):
        """Initialize the Blockchain Service with the specified network"""
        # Default values
        self.chain_id = 656476
        
        if network == "educhain":
            # Try direct setting first, then fallback to dictionary
            self.rpc_url = getattr(settings, "EDUCHAIN_RPC_URL", None)
            if not self.rpc_url:
                self.rpc_url = getattr(settings, "BLOCKCHAIN_RPC_URLS", {}).get("educhain", "https://rpc.testnet.fantom.network")
            self.explorer = getattr(settings, "BLOCKCHAIN_EXPLORERS", {}).get("educhain", "")
        else:
            # Local development chain (dev)
            self.rpc_url = "http://localhost:8545"
            self.chain_id = 1337
            self.explorer = ""
            
        logger.info(f"Initializing blockchain service for {network} using RPC URL: {self.rpc_url}")
        
        # Attempt to initialize Web3 with fallbacks
        fallback_urls = [
            self.rpc_url,
            "https://rpc.testnet.fantom.network",
            "https://rpc.ankr.com/fantom_testnet"
        ]
        
        for url in fallback_urls:
            try:
                self.web3 = Web3(Web3.HTTPProvider(url))
                if self.web3.is_connected():
                    logger.info(f"Successfully connected to RPC: {url}")
                    # Update the RPC URL to the one that works
                    self.rpc_url = url
                    break
            except Exception as e:
                logger.warning(f"Failed to connect to RPC {url}: {str(e)}")
        
        if not hasattr(self, 'web3') or not self.web3.is_connected():
            logger.error(f"Failed to connect to any blockchain endpoint")
            raise ConnectionError(f"Failed to connect to any blockchain endpoint for {network}")
            
        try:
            # Verify chain ID matches expected value
            connected_chain_id = self.web3.eth.chain_id
            if connected_chain_id != self.chain_id:
                logger.warning(f"Connected to unexpected chain ID: got {connected_chain_id}, expected {self.chain_id}")
                # Update chain ID to match what we're connected to
                self.chain_id = connected_chain_id
            
            # Create smart contract instance - Use to_checksum_address to correct the address format
            self.contract_address = self.web3.to_checksum_address(WISENTIA_CONTRACT_ADDRESS)
            self.contract = self.web3.eth.contract(
                address=self.contract_address,
                abi=WISENTIA_CONTRACT_ABI
            )
            
            logger.info(f"Blockchain service initialized: {network}, chain ID: {connected_chain_id}")
        except Exception as e:
            logger.error(f"Error during blockchain initialization: {str(e)}")
            raise ConnectionError(f"Failed to initialize blockchain services: {str(e)}")
    
    def get_admin_wallet(self):
        """Admin cüzdan bilgilerini döndür (private key güvenlik açısından environment variables'dan okunmalı)"""
        return {
            "address": os.getenv("ADMIN_WALLET_ADDRESS", settings.ADMIN_WALLET_ADDRESS),
            "private_key": os.getenv("ADMIN_WALLET_PRIVATE_KEY", settings.ADMIN_WALLET_PRIVATE_KEY)
        } 