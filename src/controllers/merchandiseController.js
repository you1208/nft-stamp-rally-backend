const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;

const prisma = new PrismaClient();

// Cloudinary設定
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// グッズオプション
const MERCHANDISE_OPTIONS = [
    {
        id: 't-shirt',
        name: 'Premium T-Shirt',
        description: 'High-quality cotton T-shirt with your NFT design',
        price: '50',
        currency: 'BDAG',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        mockupTemplate: 'tshirt_mockup'
    },
    {
        id: 'hoodie',
        name: 'Racing Hoodie',
        description: 'Comfortable hoodie featuring your NFT',
        price: '100',
        currency: 'BDAG',
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        mockupTemplate: 'hoodie_mockup'
    },
    {
        id: 'mug',
        name: 'Ceramic Mug',
        description: '11oz ceramic mug with NFT print',
        price: '30',
        currency: 'BDAG',
        sizes: ['Standard'],
        mockupTemplate: 'mug_mockup'
    },
    {
        id: 'poster',
        name: 'Art Poster',
        description: '24x36 inch premium poster',
        price: '40',
        currency: 'BDAG',
        sizes: ['24x36'],
        mockupTemplate: 'poster_mockup'
    },
    {
        id: 'phone-case',
        name: 'Phone Case',
        description: 'Custom phone case with your NFT',
        price: '35',
        currency: 'BDAG',
        sizes: ['iPhone 14/15', 'iPhone 14/15 Pro', 'Samsung Galaxy S23/S24'],
        mockupTemplate: 'phonecase_mockup'
    },
    {
        id: 'cap',
        name: 'Racing Cap',
        description: 'Adjustable cap with embroidered NFT design',
        price: '45',
        currency: 'BDAG',
        sizes: ['One Size'],
        mockupTemplate: 'cap_mockup'
    }
];

// グッズオプション取得
exports.getOptions = async (req, res) => {
    try {
        res.json({
            success: true,
            options: MERCHANDISE_OPTIONS
        });
    } catch (error) {
        console.error('Get options error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get merchandise options'
        });
    }
};

// モックアップ画像生成
async function generateMockup(nftImageUrl, merchandiseType) {
    try {
        // NFT画像のpublic_idを取得
        const nftPublicId = extractPublicId(nftImageUrl);

        // モックアップテンプレート（実際のテンプレート画像をCloudinaryにアップロードしておく）
        const mockupTemplates = {
            't-shirt': 'merchandise/templates/tshirt_white',
            'hoodie': 'merchandise/templates/hoodie_black',
            'mug': 'merchandise/templates/mug_white',
            'poster': 'merchandise/templates/poster_frame',
            'phone-case': 'merchandise/templates/phonecase_clear',
            'cap': 'merchandise/templates/cap_black'
        };

        const templateId = mockupTemplates[merchandiseType] || mockupTemplates['t-shirt'];

        // Cloudinary変換URLを生成（NFTを商品にオーバーレイ）
        const mockupUrl = cloudinary.url(templateId, {
            transformation: [
                { width: 800, height: 800, crop: 'fill' },
                {
                    overlay: nftPublicId.replace(/\//g, ':'),
                    width: 400,
                    height: 400,
                    crop: 'fit',
                    gravity: 'center',
                    y: merchandiseType === 't-shirt' ? 20 : 0,
                    flags: 'layer_apply'
                },
                { quality: 'auto:best' }
            ],
            format: 'jpg'
        });

        return mockupUrl;
    } catch (error) {
        console.error('Mockup generation error:', error);
        // フォールバック：元のNFT画像を返す
        return nftImageUrl;
    }
}

function extractPublicId(cloudinaryUrl) {
    // CloudinaryのURLからpublic_idを抽出
    const matches = cloudinaryUrl.match(/\/v\d+\/(.+)\.(jpg|png|gif)/);
    return matches ? matches[1] : '';
}

// 注文作成
exports.createOrder = async (req, res) => {
    try {
        const {
            userId,
            compositeId,
            merchandiseType,
            size,
            quantity,
            shippingInfo
        } = req.body;

        // バリデーション
        if (!userId || !compositeId || !merchandiseType || !shippingInfo) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }

        // NFTの存在確認
        const composite = await prisma.compositeNft.findUnique({
            where: { id: compositeId },
            include: {
                user: true,
                backgroundStamp: true,
                characterStamp: true
            }
        });

        if (!composite) {
            return res.status(404).json({
                success: false,
                error: 'NFT not found'
            });
        }

        // ユーザー確認
        if (composite.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'You do not own this NFT'
            });
        }

        // グッズ情報取得
        const merchandise = MERCHANDISE_OPTIONS.find(m => m.id === merchandiseType);
        if (!merchandise) {
            return res.status(400).json({
                success: false,
                error: 'Invalid merchandise type'
            });
        }

        // モックアップ画像生成
        const mockupImageUrl = await generateMockup(composite.compositeImageUrl, merchandiseType);

        // 注文をデータベースに保存
        const order = await prisma.merchandiseOrder.create({
            data: {
                userId,
                compositeId,
                merchandiseType,
                merchandiseName: merchandise.name,
                size: size || 'Standard',
                quantity: quantity || 1,
                priceAmount: merchandise.price,
                priceCurrency: merchandise.currency,
                mockupImageUrl,
                shippingInfo: JSON.stringify(shippingInfo),
                status: 'pending',
                paymentStatus: 'pending'
            }
        });

        res.json({
            success: true,
            message: 'Order created successfully',
            order: {
                id: order.id,
                merchandiseName: merchandise.name,
                mockupImageUrl,
                totalPrice: merchandise.price,
                currency: merchandise.currency
            }
        });

    } catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create order'
        });
    }
};

// ユーザーの注文一覧取得
exports.getUserOrders = async (req, res) => {
    try {
        const { userId } = req.params;

        const orders = await prisma.merchandiseOrder.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                composite: {
                    include: {
                        backgroundStamp: true,
                        characterStamp: true
                    }
                }
            }
        });

        res.json({
            success: true,
            orders
        });

    } catch (error) {
        console.error('Get orders error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get orders'
        });
    }
};