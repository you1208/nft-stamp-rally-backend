const prisma = require('../utils/prisma');
const { mintCompositeNFT } = require('../utils/blockdag');

exports.mintCompositeToBlockchain = async (req, res) => {
  try {
    const { compositeId } = req.body;

    if (!compositeId) {
      return res.status(400).json({ error: 'compositeId is required' });
    }

    const composite = await prisma.compositeNft.findUnique({
      where: { id: compositeId },
      include: {
        user: true,
        backgroundStamp: true,
        characterStamp: true,
      },
    });

    if (!composite) {
      return res.status(404).json({ error: 'Composite NFT not found' });
    }

    if (composite.nftTokenId) {
      return res.status(400).json({ 
        error: 'NFT already minted',
        tokenId: composite.nftTokenId,
        txHash: composite.nftTxHash,
      });
    }

    if (!composite.user.walletAddress) {
      return res.status(400).json({ 
        error: 'User does not have a wallet address' 
      });
    }

    console.log('Minting NFT for composite:', compositeId);
    console.log('User wallet:', composite.user.walletAddress);
    console.log('Image URL:', composite.compositeImageUrl);

    const result = await mintCompositeNFT(
      composite.user.walletAddress,
      composite.compositeImageUrl
    );

    await prisma.compositeNft.update({
      where: { id: compositeId },
      data: {
        nftTokenId: result.tokenId,
        nftTxHash: result.transactionHash,
      },
    });

    res.json({
      success: true,
      message: 'NFT minted successfully on BlockDAG!',
      tokenId: result.tokenId,
      transactionHash: result.transactionHash,
      explorerUrl: `https://bdagscan.com/tx/${result.transactionHash}`,
    });
  } catch (error) {
    console.error('Mint to blockchain error:', error);
    res.status(500).json({ 
      error: 'Failed to mint NFT to blockchain',
      details: error.message 
    });
  }
};