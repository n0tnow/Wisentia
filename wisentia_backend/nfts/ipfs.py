import requests
import json
import os
import logging
from django.conf import settings

logger = logging.getLogger('wisentia')

class IPFSService:
    """Pinata IPFS servis sınıfı - NFT metadata ve dosyaları için IPFS üzerinde depolama"""
    
    def __init__(self):
        """Initialize the IPFS service with Pinata credentials"""
        # Pinata API credentials from settings
        self.api_key = os.getenv('PINATA_API_KEY', settings.PINATA_API_KEY)
        self.secret_key = os.getenv('PINATA_SECRET_KEY', settings.PINATA_SECRET_KEY)
        self.jwt = os.getenv('PINATA_JWT', settings.PINATA_JWT)
        
        # API URLs
        self.base_url = 'https://api.pinata.cloud'
        self.pin_json_url = f'{self.base_url}/pinning/pinJSONToIPFS'
        self.pin_file_url = f'{self.base_url}/pinning/pinFileToIPFS'
        
        # Log initialization but don't expose credentials
        logger.info("IPFS Service initialized with Pinata")
        
        # Validate credentials
        if not self.api_key or not self.secret_key:
            logger.warning("Pinata API credentials missing. IPFS uploads will fail.")

    def upload_metadata(self, metadata, name=None):
        """
        Upload NFT metadata to IPFS via Pinata
        
        Args:
            metadata (dict): NFT metadata including name, description, image, attributes
            name (str, optional): Custom name for the pin
            
        Returns:
            dict: Response with IPFS hash and other details
        """
        try:
            headers = self._get_headers()
            
            # Add pinning options
            pinata_options = {
                "pinataMetadata": {
                    "name": name or f"Wisentia-NFT-Metadata-{metadata.get('name', 'Unknown')}"
                },
                "pinataContent": metadata
            }
            
            logger.info(f"Uploading metadata to IPFS for NFT: {metadata.get('name', 'Unknown')}")
            
            response = requests.post(
                self.pin_json_url,
                data=json.dumps(pinata_options),
                headers=headers
            )
            
            if response.status_code in (200, 201):
                result = response.json()
                logger.info(f"Metadata uploaded to IPFS: {result['IpfsHash']}")
                return {
                    "success": True,
                    "ipfs_hash": result["IpfsHash"],
                    "ipfs_uri": f"ipfs://{result['IpfsHash']}",
                    "gateway_url": f"https://gateway.pinata.cloud/ipfs/{result['IpfsHash']}"
                }
            else:
                logger.error(f"Failed to upload metadata to IPFS: {response.text}")
                return {
                    "success": False,
                    "error": f"Pinata API Error: {response.status_code} - {response.text}"
                }
        except Exception as e:
            logger.error(f"Error uploading to IPFS: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def upload_image(self, image_path, name=None):
        """
        Upload an image to IPFS
        
        Args:
            image_path (str): Path to the image file
            name (str, optional): Custom name for the pin
            
        Returns:
            dict: Response with IPFS hash and other details
        """
        try:
            if not os.path.exists(image_path):
                return {"success": False, "error": f"File not found: {image_path}"}
            
            headers = self._get_headers()
            del headers['Content-Type']  # Remove Content-Type for multipart form

            # Prepare the file
            with open(image_path, 'rb') as file_data:
                file_name = os.path.basename(image_path)
                
                # Create form data
                files = {
                    'file': (file_name, file_data)
                }
                
                # Add metadata
                data = {
                    'pinataMetadata': json.dumps({
                        'name': name or f"Wisentia-NFT-Image-{file_name}"
                    })
                }
                
                logger.info(f"Uploading image to IPFS: {file_name}")
                
                response = requests.post(
                    self.pin_file_url,
                    files=files,
                    data=data,
                    headers=headers
                )
            
            if response.status_code in (200, 201):
                result = response.json()
                logger.info(f"Image uploaded to IPFS: {result['IpfsHash']}")
                return {
                    "success": True,
                    "ipfs_hash": result["IpfsHash"],
                    "ipfs_uri": f"ipfs://{result['IpfsHash']}",
                    "gateway_url": f"https://gateway.pinata.cloud/ipfs/{result['IpfsHash']}"
                }
            else:
                logger.error(f"Failed to upload image to IPFS: {response.text}")
                return {
                    "success": False,
                    "error": f"Pinata API Error: {response.status_code} - {response.text}"
                }
        except Exception as e:
            logger.error(f"Error uploading image to IPFS: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }
    
    def create_nft_metadata(self, name, description, image_url, attributes=None, external_url=None):
        """
        Create standard NFT metadata format
        
        Args:
            name (str): Name of the NFT
            description (str): Description of the NFT
            image_url (str): IPFS URL of the image
            attributes (list, optional): List of attribute objects
            external_url (str, optional): External URL for the NFT
            
        Returns:
            dict: NFT metadata in standard format
        """
        metadata = {
            "name": name,
            "description": description,
            "image": image_url
        }
        
        if attributes:
            metadata["attributes"] = attributes
            
        if external_url:
            metadata["external_url"] = external_url
        
        return metadata
    
    def _get_headers(self):
        """Get headers for Pinata API requests - Prefer API key over JWT"""
        # Öncelikli olarak API key ve secret kullanımı tercih edilecek
        if self.api_key and self.secret_key:
            return {
                'Content-Type': 'application/json',
                'pinata_api_key': self.api_key,
                'pinata_secret_api_key': self.secret_key
            }
        elif self.jwt:
            logger.info("Using JWT for Pinata authentication")
            return {
                'Content-Type': 'application/json',
                'Authorization': f'Bearer {self.jwt}'
            }
        else:
            logger.error("No valid Pinata credentials available")
            return {
                'Content-Type': 'application/json'
            } 