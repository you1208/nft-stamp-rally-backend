const prisma = require('../utils/prisma');
const QRCode = require('qrcode');

exports.createStamp = async (req, res) => {
  try {
    const { type, name, imageUrl, qrCode, description } = req.body;

    if (!type || !name || !imageUrl || !qrCode) {
      return res.status(400).json({ 
        error: 'type, name, imageUrl, qrCode は必須です' 
      });
    }

    if (type !== 'background' && type !== 'character') {
      return res.status(400).json({ 
        error: 'type は background または character である必要があります' 
      });
    }

    const stamp = await prisma.stamp.create({
      data: {
        type,
        name,
        imageUrl,
        qrCode,
        description: description || '',
      },
    });

    res.status(201).json({
      success: true,
      stamp,
    });
  } catch (error) {
    console.error('Error creating stamp:', error);
    res.status(500).json({ error: 'スタンプの作成に失敗しました' });
  }
};

exports.getAllStamps = async (req, res) => {
  try {
    const stamps = await prisma.stamp.findMany({
      orderBy: {
        createdAt: 'asc',
      },
    });

    const backgrounds = stamps.filter(s => s.type === 'background');
    const characters = stamps.filter(s => s.type === 'character');

    res.json({
      success: true,
      stamps: {
        backgrounds,
        characters,
      },
      total: stamps.length,
    });
  } catch (error) {
    console.error('Error fetching stamps:', error);
    res.status(500).json({ error: 'スタンプの取得に失敗しました' });
  }
};

exports.getStampByQRCode = async (req, res) => {
  try {
    const { code } = req.params;

    const stamp = await prisma.stamp.findUnique({
      where: { qrCode: code },
    });

    if (!stamp) {
      return res.status(404).json({ error: 'スタンプが見つかりません' });
    }

    res.json({
      success: true,
      stamp,
    });
  } catch (error) {
    console.error('Error fetching stamp:', error);
    res.status(500).json({ error: 'スタンプの取得に失敗しました' });
  }
};

exports.generateQRCode = async (req, res) => {
  try {
    const { stampId } = req.params;

    const stamp = await prisma.stamp.findUnique({
      where: { id: stampId },
    });

    if (!stamp) {
      return res.status(404).json({ error: 'スタンプが見つかりません' });
    }

    const qrUrl = `${process.env.FRONTEND_URL}/acquire?code=${stamp.qrCode}`;

    const qrImage = await QRCode.toDataURL(qrUrl, {
      width: 400,
      margin: 2,
    });

    res.json({
      success: true,
      stampId: stamp.id,
      stampName: stamp.name,
      qrCode: stamp.qrCode,
      qrUrl,
      qrImage,
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'QRコードの生成に失敗しました' });
  }
};