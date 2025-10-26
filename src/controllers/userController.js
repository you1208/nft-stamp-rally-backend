const prisma = require('../utils/prisma');

exports.getUserStamps = async (req, res) => {
  try {
    const { userId } = req.params;

    const userStamps = await prisma.userStamp.findMany({
      where: { userId },
      include: {
        stamp: true,
      },
      orderBy: {
        acquiredAt: 'desc',
      },
    });

    const backgrounds = userStamps
      .filter(us => us.stamp.type === 'background')
      .map(us => us.stamp);
    
    const characters = userStamps
      .filter(us => us.stamp.type === 'character')
      .map(us => us.stamp);

    res.json({
      success: true,
      stamps: {
        backgrounds,
        characters,
      },
      total: userStamps.length,
    });
  } catch (error) {
    console.error('Error fetching user stamps:', error);
    res.status(500).json({ error: 'スタンプの取得に失敗しました' });
  }
};

exports.acquireStamp = async (req, res) => {
  try {
    const { userId, qrCode } = req.body;

    if (!userId || !qrCode) {
      return res.status(400).json({ 
        error: 'userId と qrCode は必須です' 
      });
    }

    const stamp = await prisma.stamp.findUnique({
      where: { qrCode },
    });

    if (!stamp) {
      return res.status(404).json({ error: 'スタンプが見つかりません' });
    }

    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      user = await prisma.user.findUnique({
        where: { 
          oauthProvider_oauthId: {
            oauthProvider: 'test',
            oauthId: userId
          }
        },
      });
    }

    if (!user) {
      user = await prisma.user.create({
        data: {
          oauthProvider: 'test',
          oauthId: userId,
          email: `${userId}@test.com`,
          displayName: `Test User ${userId}`,
        },
      });
      console.log('Created new test user:', user.id);
    }

    const existing = await prisma.userStamp.findUnique({
      where: {
        userId_stampId: {
          userId: user.id,
          stampId: stamp.id,
        },
      },
    });

    if (existing) {
      return res.status(400).json({ 
        error: 'このスタンプは既に獲得済みです',
        alreadyAcquired: true,
      });
    }

    const userStamp = await prisma.userStamp.create({
      data: {
        userId: user.id,
        stampId: stamp.id,
      },
      include: {
        stamp: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'スタンプを獲得しました！',
      userStamp,
      stamp: userStamp.stamp,
      userId: user.id,
    });
  } catch (error) {
    console.error('Error acquiring stamp:', error);
    res.status(500).json({ error: 'スタンプの獲得に失敗しました' });
  }
};

exports.getUserInfo = async (req, res) => {
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
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ error: 'Failed to fetch user info' });
  }
};