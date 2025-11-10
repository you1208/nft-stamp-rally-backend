const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const axios = require('axios');
const sharp = require('sharp');

// 画像をダウンロードしてBufferとして取得
async function downloadImage(url) {
  try {
    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 10000 
    });
    return Buffer.from(response.data);
  } catch (error) {
    console.error(`Failed to download image from ${url}:`, error.message);
    throw error;
  }
}

// 背景とキャラクターを合成
async function composeImages(backgroundUrl, characterUrl) {
  try {
    console.log('=== Starting Image Composition ===');
    console.log('Background URL:', backgroundUrl);
    console.log('Character URL:', characterUrl);

    // 画像をダウンロード
    const [backgroundBuffer, characterBuffer] = await Promise.all([
      downloadImage(backgroundUrl),
      downloadImage(characterUrl)
    ]);

    console.log('Images downloaded successfully');

    // 背景画像のサイズを取得
    const backgroundImage = sharp(backgroundBuffer);
    const backgroundMetadata = await backgroundImage.metadata();
    const { width: bgWidth, height: bgHeight } = backgroundMetadata;

    console.log(`Background size: ${bgWidth}x${bgHeight}`);

    // キャラクター画像をリサイズ（背景の40%のサイズ）
    const characterSize = Math.floor(Math.min(bgWidth, bgHeight) * 0.4);
    const resizedCharacter = await sharp(characterBuffer)
      .resize(characterSize, characterSize, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .png()
      .toBuffer();

    console.log(`Character resized to: ${characterSize}x${characterSize}`);

    // キャラクターを右下に配置
    const x = bgWidth - characterSize - Math.floor(bgWidth * 0.05);
    const y = bgHeight - characterSize - Math.floor(bgHeight * 0.05);

    // 画像を合成
    const composedImage = await backgroundImage
      .composite([
        {
          input: resizedCharacter,
          top: y,
          left: x
        }
      ])
      .jpeg({ quality: 90 })
      .toBuffer();

    console.log('Image composition completed');

    // Base64エンコード
    const base64Image = composedImage.toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    console.log('Image converted to base64, length:', base64Image.length);

    return dataUrl;

  } catch (error) {
    console.error('=== Image Composition Error ===');
    console.error('Error:', error);
    throw error;
  }
}

router.post('/create', async (req, res) => {
  try {
    console.log('\n=== Composite Creation Request ===');
    console.log('req.user:', req.user);
    console.log('req.session:', req.session);
    console.log('Request Body:', JSON.stringify(req.body, null, 2));

    const { backgroundId, characterId, userId: bodyUserId } = req.body;

    // ユーザーIDの取得（複数の方法を試す）
    let userId;
    if (req.user && req.user.id) {
      userId = req.user.id;
      console.log('User ID from req.user:', userId);
    } else if (req.session && req.session.passport && req.session.passport.user) {
      userId = req.session.passport.user.id || req.session.passport.user;
      console.log('User ID from session:', userId);
    } else if (bodyUserId) {
      // フロントエンドから直接送信された場合
      userId = bodyUserId;
      console.log('User ID from request body:', userId);
    } else {
      console.error('No user ID found in request');
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    // Validate input
    if (!backgroundId || !characterId) {
      console.error('Missing required fields');
      return res.status(400).json({
        success: false,
        error: 'Background ID and Character ID are required'
      });
    }

    // ... 以下は既存のコードをそのまま

    console.log('\n--- Fetching Stamps ---');
    
    // Get background and character stamps
    const background = await prisma.stamp.findUnique({
      where: { id: backgroundId }
    });

    const character = await prisma.stamp.findUnique({
      where: { id: characterId }
    });

    console.log('Background found:', background ? background.name : 'NOT FOUND');
    console.log('Character found:', character ? character.name : 'NOT FOUND');

    if (!background || !character) {
      console.error('Stamps not found in database');
      return res.status(404).json({
        success: false,
        error: 'Background or character not found'
      });
    }

    // Validate stamp types
    // Validate stamp types (case-insensitive)
if (background.type.toLowerCase() !== 'background' || character.type.toLowerCase() !== 'character') {
      console.error('Invalid stamp types:', { 
        backgroundType: background.type, 
        characterType: character.type 
      });
      return res.status(400).json({
        success: false,
        error: 'Invalid stamp types'
      });
    }

    console.log('\n--- Composing Images ---');

    // Compose images
    let compositeImageUrl;
    try {
      compositeImageUrl = await composeImages(background.imageUrl, character.imageUrl);
      console.log('✅ Image composition successful');
    } catch (error) {
      console.error('❌ Image composition failed:', error.message);
      // フォールバック: 背景画像を使用
      compositeImageUrl = background.imageUrl;
      console.log('Using background image as fallback');
    }

    console.log('\n--- Creating Composite Record ---');

    // Create composite record
    const composite = await prisma.composite.create({
      data: {
        userId,
        backgroundId,
        characterId,
        imageUrl: compositeImageUrl,
        name: `${background.name} × ${character.name}`,
        description: `A unique NFT combining ${background.name} and ${character.name}`
      },
      include: {
        background: true,
        character: true
      }
    });

    console.log('✅ Composite created:', composite.id);
    console.log('Name:', composite.name);
    console.log('Image URL length:', compositeImageUrl.length);

    res.json({
      success: true,
      composite: {
        id: composite.id,
        name: composite.name,
        description: composite.description,
        imageUrl: compositeImageUrl,
        background: {
          id: composite.background.id,
          name: composite.background.name
        },
        character: {
          id: composite.character.id,
          name: composite.character.name
        }
      },
      compositeImageUrl
    });

  } catch (error) {
    console.error('\n=== Composite Creation Error ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      success: false,
      error: 'Failed to create composite',
      details: error.message
    });
  }
});

// Get all composites for user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;

    const composites = await prisma.composite.findMany({
      where: { userId },
      include: {
        background: true,
        character: true
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
      error: 'Failed to fetch composites'
    });
  }
});

// Get single composite
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const composite = await prisma.composite.findFirst({
      where: {
        id,
        userId
      },
      include: {
        background: true,
        character: true
      }
    });

    if (!composite) {
      return res.status(404).json({
        success: false,
        error: 'Composite not found'
      });
    }

    res.json({
      success: true,
      composite
    });

  } catch (error) {
    console.error('Get composite error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch composite'
    });
  }
});

module.exports = router;