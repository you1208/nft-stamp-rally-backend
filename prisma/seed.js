const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const stamps = [
    // Background Stamps (5)
    {
      type: 'background',
      name: 'Mountain',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop',
      qrCode: 'BG001',
      description: 'Beautiful mountain landscape'
    },
    {
      type: 'background',
      name: 'Ocean',
      imageUrl: 'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=400&h=300&fit=crop',
      qrCode: 'BG002',
      description: 'Blue ocean view'
    },
    {
      type: 'background',
      name: 'City',
      imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=400&h=300&fit=crop',
      qrCode: 'BG003',
      description: 'City night view'
    },
    {
      type: 'background',
      name: 'Forest',
      imageUrl: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=400&h=300&fit=crop',
      qrCode: 'BG004',
      description: 'Mystical forest'
    },
    {
      type: 'background',
      name: 'Desert',
      imageUrl: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400&h=300&fit=crop',
      qrCode: 'BG005',
      description: 'Sandy desert landscape'
    },
    // Character Stamps (5)
    {
      type: 'character',
      name: 'Robot',
      imageUrl: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=300&h=400&fit=crop',
      qrCode: 'CH001',
      description: 'Cool robot character'
    },
    {
      type: 'character',
      name: 'Cat',
      imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&h=400&fit=crop',
      qrCode: 'CH002',
      description: 'Cute cat character'
    },
    {
      type: 'character',
      name: 'Astronaut',
      imageUrl: 'https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=300&h=400&fit=crop',
      qrCode: 'CH003',
      description: 'Space astronaut'
    },
    {
      type: 'character',
      name: 'Wizard',
      imageUrl: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=300&h=400&fit=crop',
      qrCode: 'CH004',
      description: 'Magical wizard'
    },
    {
      type: 'character',
      name: 'Knight',
      imageUrl: 'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=300&h=400&fit=crop',
      qrCode: 'CH005',
      description: 'Brave knight'
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