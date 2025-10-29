const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const stamps = [
    {
      type: 'background',
      name: 'Mountain',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      qrCode: 'BG001',
      description: '美しい山の風景'
    },
    {
      type: 'background',
      name: 'Ocean',
      imageUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
      qrCode: 'BG002',
      description: '青い海の風景'
    },
    {
      type: 'background',
      name: 'City',
      imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=300&fit=crop',
      qrCode: 'BG003',
      description: '都市の夜景'
    },
    {
      type: 'character',
      name: 'Robot',
      imageUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=300&h=400&fit=crop',
      qrCode: 'CH001',
      description: 'かっこいいロボット'
    },
    {
      type: 'character',
      name: 'Cat',
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=400&fit=crop',
      qrCode: 'CH002',
      description: 'かわいい猫'
    },
    {
      type: 'character',
      name: 'Astronaut',
      imageUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=400&fit=crop',
      qrCode: 'CH003',
      description: '宇宙飛行士'
    }
  ];

  for (const stamp of stamps) {
    const created = await prisma.stamp.upsert({
      where: { qrCode: stamp.qrCode },
      update: stamp,
      create: stamp,
    });
    console.log(`✓ Created stamp: ${stamp.name} (${stamp.qrCode})`);
  }

  console.log('✅ Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });