const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Cloudinary is optional for placeholder mode
let cloudinary = null;
try {
    cloudinary = require('../config/cloudinary');
} catch (error) {
    console.log('Cloudinary not configured, using placeholder images only');
}

// Helper function to extract Cloudinary public ID
function extractCloudinaryPublicId(url) {
    if (!url || typeof url !== 'string') return null;
    
    // Match Cloudinary URL pattern
    const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)/i);
    if (match) {
        return match[1];
    }
    
    return null;
}

// Create composite NFT
router.post('/create', async (req, res) => {
    try {
        const { userId, backgroundStampId, characterStampId } = req.body;

        console.log('=== Creating composite NFT ===');
        console.log('User ID:', userId);
        console.log('Background Stamp ID:', backgroundStampId);
        console.log('Character Stamp ID:', characterStampId);

        // Validate input
        if (!userId || !backgroundStampId || !characterStampId) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // Get stamps
        const backgroundStamp = await prisma.stamp.findUnique({
            where: { id: backgroundStampId }
        });

        const characterStamp = await prisma.stamp.findUnique({
            where: { id: characterStampId }
        });

        if (!backgroundStamp || !characterStamp) {
            console.error('Stamps not found');
            return res.status(404).json({
                success: false,
                error: 'Stamps not found'
            });
        }

        console.log('Background stamp:', backgroundStamp.name, backgroundStamp.imageUrl);
        console.log('Character stamp:', characterStamp.name, characterStamp.imageUrl);

        // Create composite image URL
        // For demo, we'll use a simple side-by-side layout
        let compositeImageUrl;
        
        // Check if we can use Cloudinary
        if (cloudinary && !backgroundStamp.imageUrl.includes('unsplash')) {
            try {
                const bgPublicId = extractCloudinaryPublicId(backgroundStamp.imageUrl);
                const charPublicId = extractCloudinaryPublicId(characterStamp.imageUrl);

                if (bgPublicId && charPublicId) {
                    compositeImageUrl = cloudinary.url(bgPublicId, {
                        transformation: [
                            { width: 800, height: 600, crop: 'fill' },
                            {
                                overlay: charPublicId,
                                width: 400,
                                height: 400,
                                crop: 'fit',
                                gravity: 'center'
                            }
                        ],
                        format: 'png',
                        quality: 'auto'
                    });
                    console.log('Using Cloudinary composite:', compositeImageUrl);
                } else {
                    throw new Error('Could not extract Cloudinary IDs');
                }
            } catch (cloudinaryError) {
                console.log('Cloudinary failed, using fallback');
                compositeImageUrl = null;
            }
        }
        
        // Fallback: Create a descriptive placeholder
        if (!compositeImageUrl) {
            const compositeName = `${backgroundStamp.name} × ${characterStamp.name}`;
            compositeImageUrl = `https://placehold.co/800x600/667eea/white?text=${encodeURIComponent(compositeName)}&font=raleway`;
            console.log('Using placeholder composite:', compositeImageUrl);
        }

        // Create composite NFT record
        const composite = await prisma.compositeNft.create({
            data: {
                userId,
                backgroundStampId,
                characterStampId,
                compositeImageUrl
            },
            include: {
                backgroundStamp: true,
                characterStamp: true
            }
        });

        console.log('✅ Composite created successfully:', composite.id);
        console.log('Composite image URL:', compositeImageUrl);

        res.json({
            success: true,
            composite,
            compositeImageUrl
        });

    } catch (error) {
        console.error('❌ Create composite error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            error: 'NFTの合成に失敗しました',
            details: error.message
        });
    }
});

// Get user's composite NFTs
router.get('/user/:userId', async (req, res) => {
    try {
        const { userId } = req.params;

        const composites = await prisma.compositeNft.findMany({
            where: { userId },
            include: {
                backgroundStamp: true,
                characterStamp: true
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json({
            success: true,
            composites
        });

    } catch (error) {
        console.error('Get composites error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get composites'
        });
    }
});

// Generate high-res composite
router.post('/:compositeId/high-res', async (req, res) => {
    try {
        const { compositeId } = req.params;

        const composite = await prisma.compositeNft.findUnique({
            where: { id: compositeId },
            include: {
                backgroundStamp: true,
                characterStamp: true
            }
        });

        if (!composite) {
            return res.status(404).json({
                success: false,
                error: 'Composite not found'
            });
        }

        // For now, just return the existing image URL with higher quality parameter
        const highResImageUrl = composite.compositeImageUrl.includes('placehold.co')
            ? composite.compositeImageUrl.replace('600', '1200')
            : composite.compositeImageUrl + '&q=100';

        res.json({
            success: true,
            highResImageUrl
        });

    } catch (error) {
        console.error('Generate high-res error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate high-res image'
        });
    }
});

module.exports = router;