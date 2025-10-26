const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // スタンプデータ
  const stamps = [
    {
      type: 'background',
      name: 'Mountain',
      imageUrl: 'https://via.placeholder.com/400x300/4CAF50/ffffff?text=Mountain',
      qrCode: 'BG001',
      description: '美しい山の風景'
    },
    {
      type: 'background',
      name: 'Ocean',
      imageUrl: 'https://via.placeholder.com/400x300/2196F3/ffffff?text=Ocean',
      qrCode: 'BG002',
      description: '青い海の風景'
    },
    {
      type: 'background',
      name: 'City',
      imageUrl: 'https://via.placeholder.com/400x300/FF9800/ffffff?text=City',
      qrCode: 'BG003',
      description: '都市の夜景'
    },
    {
      type: 'character',
      name: 'Robot',
      imageUrl: 'https://via.placeholder.com/300x400/9C27B0/ffffff?text=Robot',
      qrCode: 'CH001',
      description: 'かっこいいロボット'
    },
    {
      type: 'character',
      name: 'Cat',
      imageUrl: 'https://via.placeholder.com/300x400/E91E63/ffffff?text=Cat',
      qrCode: 'CH002',
      description: 'かわいい猫'
    },
    {
      type: 'character',
      name: 'Astronaut',
      imageUrl: 'https://via.placeholder.com/300x400/00BCD4/ffffff?text=Astronaut',
      qrCode: 'CH003',
      description: '宇宙飛行士'
    }
  ];

  for (const stamp of stamps) {
    await prisma.stamp.upsert({
      where: { qrCode: stamp.qrCode },
      update: stamp,
      create: stamp,
    });
    console.log(`Created stamp: ${stamp.name}`);
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error('Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });