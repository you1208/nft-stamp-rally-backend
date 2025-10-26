const prisma = require('../utils/prisma');
const { createCompositeImage } = require('../utils/imageComposer');

exports.createComposite = async (req, res) => {
  try {
    const { userId, backgroundStampId, characterStampId } = req.body;
    if (!userId || !backgroundStampId || !characterStampId) {
      return res.status(400).json({ error: 'userId, backgroundStampId, characterStampId は必須です' });
    }
    const hasBackground = await prisma.userStamp.findUnique({
      where: { userId_stampId: { userId, stampId: backgroundStampId } }
    });
    const hasCharacter = await prisma.userStamp.findUnique({
      where: { userId_stampId: { userId, stampId: characterStampId } }
    });
    if (!hasBackground || !hasCharacter) {
      return res.status(400).json({ error: '選択したスタンプを獲得していません' });
    }
    const backgroundStamp = await prisma.stamp.findUnique({ where: { id: backgroundStampId } });
    const characterStamp = await prisma.stamp.findUnique({ where: { id: characterStampId } });
    const compositeId = 'composite_' + Date.now();
    console.log('Creating composite image...');
    console.log('Background:', backgroundStamp.imageUrl);
    console.log('Character:', characterStamp.imageUrl);
    let compositeImageUrl;
    try {
      compositeImageUrl = await createCompositeImage(backgroundStamp.imageUrl, characterStamp.imageUrl, userId, compositeId);
      console.log('Composite created successfully:', compositeImageUrl);
    } catch (error) {
      console.error('Image composition failed:', error);
      compositeImageUrl = 'composite_' + backgroundStamp.name + '_' + characterStamp.name + '.png';
    }
    const composite = await prisma.compositeNft.create({
      data: { userId, backgroundStampId, characterStampId, compositeImageUrl },
      include: { backgroundStamp: true, characterStamp: true }
    });
    res.status(201).json({ success: true, message: 'NFTを合成しました！', composite, compositeImageUrl });
  } catch (error) {
    console.error('Error creating composite:', error);
    res.status(500).json({ error: 'NFTの合成に失敗しました' });
  }
};

exports.getUserComposites = async (req, res) => {
  try {
    const { userId } = req.params;
    const composites = await prisma.compositeNft.findMany({
      where: { userId },
      include: { backgroundStamp: true, characterStamp: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, composites, total: composites.length });
  } catch (error) {
    console.error('Error fetching composites:', error);
    res.status(500).json({ error: '合成NFTの取得に失敗しました' });
  }
};