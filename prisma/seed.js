const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const stamps = [
    // Background Stamps - F1 Racing Scenes (5)
    {
      type: 'background',
      name: 'Monaco Grand Prix',
      imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop&q=90',
      qrCode: 'BG001',
      description: 'Legendary Monaco street circuit'
    },
    {
      type: 'background',
      name: 'Racing Circuit',
      imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&h=600&fit=crop&q=90',
      qrCode: 'BG002',
      description: 'Modern F1 racing track'
    },
    {
      type: 'background',
      name: 'Pit Lane',
      imageUrl: 'https://images.unsplash.com/photo-1612810806563-4cb8265db55f?w=800&h=600&fit=crop&q=90',
      qrCode: 'BG003',
      description: 'F1 pit stop zone'
    },
    {
      type: 'background',
      name: 'Victory Podium',
      imageUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=800&h=600&fit=crop&q=90',
      qrCode: 'BG004',
      description: 'Championship celebration'
    },
    {
      type: 'background',
      name: 'Night Race',
      imageUrl: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop&q=90',
      qrCode: 'BG005',
      description: 'Singapore night circuit'
    },
    // Character Stamps - F1 Elements (5)
    {
      type: 'character',
      name: 'F1 Racing Car',
      imageUrl: 'https://images.unsplash.com/photo-1600712242805-5f78671b24da?w=600&h=600&fit=crop&q=90',
      qrCode: 'CH001',
      description: 'Formula 1 racing machine'
    },
    {
      type: 'character',
      name: 'Racing Helmet',
      imageUrl: 'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600&h=600&fit=crop&q=90',
      qrCode: 'CH002',
      description: 'Professional driver helmet'
    },
    {
      type: 'character',
      name: 'Alpine Logo',
      imageUrl: 'https://images.unsplash.com/photo-1614332625532-9b9b9b9b9b9b?w=600&h=600&fit=crop&q=90',
      qrCode: 'CH003',
      description: 'Alpine F1 Team emblem'
    },
    {
      type: 'character',
      name: 'Trophy',
      imageUrl: 'https://images.unsplash.com/photo-1581889470536-467bdbe30cd0?w=600&h=600&fit=crop&q=90',
      qrCode: 'CH004',
      description: 'Championship trophy'
    },
    {
      type: 'character',
      name: 'Checkered Flag',
      imageUrl: 'https://images.unsplash.com/photo-1566168193556-cfb77d04a6c7?w=600&h=600&fit=crop&q=90',
      qrCode: 'CH005',
      description: 'Victory flag'
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