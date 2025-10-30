const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');

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

// スタンプ獲得
exports.acquireStamp = async (req, res) => {
    try {
        const { userId, qrCode } = req.body;

        if (!userId || !qrCode) {
            return res.status(400).json({ 
                success: false, 
                error: '必要なパラメータが不足しています' 
            });
        }

        // QRコードからスタンプを検索
        const stamp = await prisma.stamp.findUnique({
            where: { qrCode }
        });

        if (!stamp) {
            return res.status(404).json({ 
                success: false, 
                error: 'スタンプが見つかりません' 
            });
        }

        // ユーザーを確認
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ 
                success: false, 
                error: 'ユーザーが見つかりません' 
            });
        }

        // 既に獲得済みか確認
        const existing = await prisma.userStamp.findUnique({
            where: {
                userId_stampId: {
                    userId,
                    stampId: stamp.id
                }
            }
        });

        if (existing) {
            return res.status(400).json({ 
                success: false, 
                error: '既に獲得済みのスタンプです' 
            });
        }

        // スタンプを獲得
        const userStamp = await prisma.userStamp.create({
            data: {
                userId,
                stampId: stamp.id
            },
            include: {
                stamp: true
            }
        });

        res.json({
            success: true,
            message: 'スタンプを獲得しました！',
            userStamp,
            stamp,
            userId
        });

    } catch (error) {
        console.error('Acquire stamp error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'スタンプの獲得に失敗しました' 
        });
    }
};

// ユーザーのスタンプ取得
exports.getUserStamps = async (req, res) => {
    try {
        const { userId } = req.params;

        const userStamps = await prisma.userStamp.findMany({
            where: { userId },
            include: {
                stamp: true
            },
            orderBy: {
                acquiredAt: 'desc'
            }
        });

        // 背景とキャラクターに分類
        const backgrounds = {};
        const characters = {};

        userStamps.forEach(us => {
            if (us.stamp.type === 'background') {
                backgrounds[us.stamp.id] = us.stamp;
            } else if (us.stamp.type === 'character') {
                characters[us.stamp.id] = us.stamp;
            }
        });

        res.json({
            success: true,
            stamps: {
                backgrounds,
                characters
            },
            total: userStamps.length
        });

    } catch (error) {
        console.error('Get user stamps error:', error);
        res.status(500).json({ 
            success: false,
            error: 'ユーザースタンプの取得に失敗しました' 
        });
    }
};