const { ethers } = require('ethers');
const StampNFTABI = require('../abi/StampNFT.json');

const provider = new ethers.JsonRpcProvider(process.env.BLOCKDAG_RPC_URL);

const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  StampNFTABI.abi,
  wallet
);

async function mintStampNFT(toAddress, tokenURI) {
  try {
    console.log('Minting stamp NFT to:', toAddress);
    console.log('Token URI:', tokenURI);
    
    const tx = await contract.mintStamp(toAddress, tokenURI, {
      gasLimit: 500000
    });
    
    console.log('Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);
    
    const tokenId = receipt.logs && receipt.logs[0] && receipt.logs[0].topics 
      ? parseInt(receipt.logs[0].topics[2], 16) 
      : 'unknown';
    
    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId: tokenId.toString(),
    };
  } catch (error) {
    console.error('Mint error:', error);
    throw error;
  }
}

async function mintCompositeNFT(toAddress, tokenURI) {
  try {
    console.log('Minting composite NFT to:', toAddress);
    console.log('Token URI:', tokenURI);
    
    const tx = await contract.mintComposite(toAddress, tokenURI, {
      gasLimit: 500000
    });
    
    console.log('Transaction sent:', tx.hash);
    
    const receipt = await tx.wait();
    console.log('Transaction confirmed:', receipt.hash);
    
    const tokenId = receipt.logs && receipt.logs[0] && receipt.logs[0].topics 
      ? parseInt(receipt.logs[0].topics[2], 16) 
      : 'unknown';
    
    return {
      success: true,
      transactionHash: receipt.hash,
      tokenId: tokenId.toString(),
    };
  } catch (error) {
    console.error('Mint error:', error);
    throw error;
  }
}

async function getBalance(address) {
  return await provider.getBalance(address);
}

module.exports = {
  mintStampNFT,
  mintCompositeNFT,
  getBalance,
  provider,
  contract,
};