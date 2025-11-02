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

// モックアップ画像生成（改善版）
async function generateMockup(nftImageUrl, merchandiseType) {
    try {
        console.log('Generating mockup for:', merchandiseType);
        
        // 商品テンプレートの設定
        const mockupConfig = {
            't-shirt': {
                template: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop',
                nftOverlay: {
                    width: 300,
                    height: 300,
                    x: 0,
                    y: -50,
                    gravity: 'center'
                }
            },
            'hoodie': {
                template: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=800&fit=crop',
                nftOverlay: {
                    width: 280,
                    height: 280,
                    x: 0,
                    y: -30,
                    gravity: 'center'
                }
            },
            'mug': {
                template: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&h=800&fit=crop',
                nftOverlay: {
                    width: 250,
                    height: 250,
                    x: -20,
                    y: 0,
                    gravity: 'center'
                }
            },
            'poster': {
                template: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=800&h=800&fit=crop',
                nftOverlay: {
                    width: 400,
                    height: 400,
                    x: 0,
                    y: 0,
                    gravity: 'center'
                }
            },
            'phone-case': {
                template: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=800&h=800&fit=crop',
                nftOverlay: {
                    width: 200,
                    height: 350,
                    x: 0,
                    y: -20,
                    gravity: 'center'
                }
            },
            'cap': {
                template: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800&h=800&fit=crop',
                nftOverlay: {
                    width: 200,
                    height: 200,
                    x: 0,
                    y: 20,
                    gravity: 'center'
                }
            }
        };

        const config = mockupConfig[merchandiseType] || mockupConfig['t-shirt'];

        // テンプレート画像をCloudinaryにアップロード（キャッシュされる）
        const templateUpload = await cloudinary.uploader.upload(config.template, {
            folder: 'nft-stamp-rally/templates',
            public_id: `${merchandiseType}_template`,
            overwrite: false,
            resource_type: 'image'
        });

        console.log('Template uploaded:', templateUpload.public_id);

        // NFT画像のpublic_idを取得
        const nftPublicId = extractPublicId(nftImageUrl);

        if (!nftPublicId) {
            console.error('Could not extract NFT public_id from:', nftImageUrl);
            return nftImageUrl;
        }

        console.log('NFT public_id:', nftPublicId);

        // Cloudinary変換でNFTをテンプレートに重ねる
        const mockupUrl = cloudinary.url(templateUpload.public_id, {
            transformation: [
                { width: 800, height: 800, crop: 'fill' },
                {
                    overlay: nftPublicId.replace(/\//g, ':'),
                    width: config.nftOverlay.width,
                    height: config.nftOverlay.height,
                    crop: 'fill',
                    gravity: config.nftOverlay.gravity,
                    x: config.nftOverlay.x,
                    y: config.nftOverlay.y,
                    flags: 'layer_apply',
                    effect: 'brightness:10'
                },
                { quality: 'auto:best' }
            ],
            format: 'jpg'
        });

        console.log('Mockup generated:', mockupUrl);
        return mockupUrl;

    } catch (error) {
        console.error('Mockup generation error:', error);
        return nftImageUrl;
    }
}

function extractPublicId(cloudinaryUrl) {
    try {
        // CloudinaryのURLからpublic_idを抽出
        const matches = cloudinaryUrl.match(/\/v\d+\/(.+)\.(jpg|png|gif|jpeg)/);
        return matches ? matches[1] : '';
    } catch (error) {
        console.error('Extract public_id error:', error);
        return '';
    }
}

// モックアッププレビュー生成エンドポイント
exports.generateMockupPreview = async (req, res) => {
    try {
        const { nftImageUrl, merchandiseType } = req.body;

        if (!nftImageUrl || !merchandiseType) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters'
            });
        }

        const mockupUrl = await generateMockup(nftImageUrl, merchandiseType);

        res.json({
            success: true,
            mockupUrl: mockupUrl
        });

    } catch (error) {
        console.error('Generate mockup preview error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate mockup'
        });
    }
};

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