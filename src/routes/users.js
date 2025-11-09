const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Get user info
router.get('/:userId/info', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                displayName: user.displayName,
                email: user.email,
                walletAddress: user.walletAddress,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Get user info error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user info'
        });
    }
});

// Get user stamps
router.get('/:userId/stamps', async (req, res) => {
    try {
        const { userId } = req.params;

        const userStamps = await prisma.userStamp.findMany({
            where: { userId },
            include: { stamp: true },
            orderBy: { acquiredAt: 'desc' }
        });

        const grouped = {
            backgrounds: {},
            characters: {}
        };

        userStamps.forEach(us => {
            if (us.stamp.type === 'background') {
                grouped.backgrounds[us.stamp.id] = us.stamp;
            } else if (us.stamp.type === 'character') {
                grouped.characters[us.stamp.id] = us.stamp;
            }
        });

        res.json({
            success: true,
            stamps: grouped
        });

    } catch (error) {
        console.error('Get user stamps error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get user stamps'
        });
    }
});

// Export wallet information
router.get('/:userId/wallet-export', async (req, res) => {
    try {
        const { userId } = req.params;

        // Get user info
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Get NFT count
        const nftCount = await prisma.compositeNft.count({
            where: { userId }
        });

        // Get minted NFTs
        const mintedNfts = await prisma.compositeNft.findMany({
            where: {
                userId,
                nftTxHash: { not: null }
            },
            include: {
                backgroundStamp: true,
                characterStamp: true
            }
        });

        res.json({
            success: true,
            walletAddress: user.walletAddress,
            email: user.email,
            displayName: user.displayName,
            createdAt: user.createdAt,
            nftCount: nftCount,
            mintedNftCount: mintedNfts.length,
            nfts: mintedNfts.map(nft => ({
                name: `${nft.backgroundStamp.name} × ${nft.characterStamp.name}`,
                tokenId: nft.nftTokenId,
                txHash: nft.nftTxHash,
                createdAt: nft.createdAt
            }))
        });

    } catch (error) {
        console.error('Wallet export error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export wallet info'
        });
    }
});

// Reset user data (for demo purposes)
router.delete('/:userId/reset', async (req, res) => {
    try {
        const { userId } = req.params;
        
        console.log(`=== Resetting data for user: ${userId} ===`);

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            console.log('User not found');
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Delete user's merchandise orders (if table exists)
        let deletedOrders = { count: 0 };
        try {
            deletedOrders = await prisma.merchandiseOrder.deleteMany({
                where: { userId }
            });
            console.log(`Deleted ${deletedOrders.count} merchandise orders`);
        } catch (orderError) {
            console.log('MerchandiseOrder table does not exist yet, skipping...');
        }

        // Delete user's composite NFTs
        const deletedComposites = await prisma.compositeNft.deleteMany({
            where: { userId }
        });
        console.log(`Deleted ${deletedComposites.count} composite NFTs`);

        // Delete user's stamps
        const deletedStamps = await prisma.userStamp.deleteMany({
            where: { userId }
        });
        console.log(`Deleted ${deletedStamps.count} user stamps`);

        console.log(`✅ User ${userId} data reset successfully!`);

        res.json({
            success: true,
            message: 'User data reset successfully',
            deleted: {
                orders: deletedOrders.count,
                nfts: deletedComposites.count,
                stamps: deletedStamps.count
            }
        });

    } catch (error) {
        console.error('Reset user data error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to reset user data: ' + error.message
        });
    }
});

module.exports = router;