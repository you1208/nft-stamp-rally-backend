const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

const prisma = new PrismaClient();

// 全スタンプ取得
exports.getAllStamps = async (req, res) => {
    try {
        const stamps = await prisma.stamp.findMany({
            orderBy: {
                createdAt: 'asc'
            }
        });

        // 背景とキャラクターに分類
        const backgrounds = stamps.filter(s => s.type === 'background');
        const characters = stamps.filter(s => s.type === 'character');

        res.json({
            success: true,
            stamps: {
                backgrounds,
                characters
            },
            total: stamps.length
        });
    } catch (error) {
        console.error('Error fetching stamps:', error);
        res.status(500).json({ 
            success: false, 
            error: 'スタンプの取得に失敗しました' 
        });
    }
};

// NFT合成
exports.createComposite = async (req, res) => {
    try {
        const { userId, backgroundStampId, characterStampId } = req.body;

        if (!userId || !backgroundStampId || !characterStampId) {
            return res.status(400).json({ 
                success: false, 
                error: '必要なパラメータが不足しています' 
            });
        }

        // スタンプを取得
        const backgroundStamp = await prisma.stamp.findUnique({ 
            where: { id: backgroundStampId } 
        });
        const characterStamp = await prisma.stamp.findUnique({ 
            where: { id: characterStampId } 
        });

        if (!backgroundStamp || !characterStamp) {
            return res.status(404).json({ 
                success: false, 
                error: 'スタンプが見つかりません' 
            });
        }

        // Cloudinaryで画像を合成
        const compositeResult = await cloudinary.uploader.upload(backgroundStamp.imageUrl, {
            folder: `nft-stamps/${userId}`,
            transformation: [
                { width: 800, height: 600, crop: 'fill' },
                {
                    overlay: {
                        url: characterStamp.imageUrl
                    },
                    width: 400,
                    height: 533,
                    gravity: 'center',
                    crop: 'fit'
                }
            ]
        });

        // 合成NFTをDBに保存
        const composite = await prisma.compositeNft.create({
            data: {
                userId,
                backgroundStampId,
                characterStampId,
                compositeImageUrl: compositeResult.secure_url
            },
            include: {
                backgroundStamp: true,
                characterStamp: true
            }
        });

        res.json({
            success: true,
            message: 'NFTを合成しました！',
            composite,
            compositeImageUrl: compositeResult.secure_url
        });

    } catch (error) {
        console.error('Create composite error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'NFTの合成に失敗しました' 
        });
    }
};

// ユーザーの合成NFT一覧
exports.getUserComposites = async (req, res) => {
    try {
        const { userId } = req.params;

        const composites = await prisma.compositeNft.findMany({
            where: { userId },
            include: {
                backgroundStamp: true,
                characterStamp: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json({
            success: true,
            composites
        });

    } catch (error) {
        console.error('Get user composites error:', error);
        res.status(500).json({ 
            success: false, 
            error: '合成NFTの取得に失敗しました' 
        });
    }
};

// 高解像度画像生成
exports.generateHighResImage = async (req, res) => {
    try {
        const { compositeId } = req.params;

        // 合成NFTを取得
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
                error: '合成NFTが見つかりません' 
            });
        }

        // 高解像度で合成（2400x1800）
        const highResUrl = await cloudinary.uploader.upload(composite.backgroundStamp.imageUrl, {
            folder: `nft-stamps/${composite.userId}`,
            transformation: [
                { width: 2400, height: 1800, crop: 'fill' },
                {
                    overlay: {
                        url: composite.characterStamp.imageUrl
                    },
                    width: 1200,
                    height: 1600,
                    gravity: 'center',
                    crop: 'fit'
                }
            ]
        });

        res.json({
            success: true,
            highResImageUrl: highResUrl.secure_url,
            width: 2400,
            height: 1800
        });

    } catch (error) {
        console.error('Generate high-res image error:', error);
        res.status(500).json({ 
            success: false, 
            error: '高解像度画像の生成に失敗しました' 
        });
    }
};