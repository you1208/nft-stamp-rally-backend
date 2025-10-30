const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// ユーザー情報取得
router.get('/:userId/info', async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                displayName: true,
                walletAddress: true,
                oauthProvider: true,
                createdAt: true
            }
        });

        if (!user) {
            return res.status(404).json({ 
                success: false,
                error: 'User not found' 
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Get user info error:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to get user info' 
        });
    }
});

// ユーザーのスタンプ取得
router.get('/:userId/stamps', async (req, res) => {
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
            error: 'Failed to get user stamps' 
        });
    }
});

module.exports = router;