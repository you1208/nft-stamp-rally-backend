const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const stamps = [
    // Background Stamps - F1 Racing Tracks & Scenes (5)
    {
      type: 'background',
      name: 'Monaco Grand Prix',
      imageUrl: 'https://images.unsplash.com/photo-1532906619279-a4b7267faa66?w=600&h=400&fit=crop&q=80',
      qrCode: 'BG001',
      description: 'Legendary Monaco street circuit at sunset'
    },
    {
      type: 'background',
      name: 'Spa-Francorchamps',
      imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&h=400&fit=crop&q=80',
      qrCode: 'BG002',
      description: 'Historic Belgian Grand Prix circuit'
    },
    {
      type: 'background',
      name: 'Racing Pit Lane',
      imageUrl: 'https://images.unsplash.com/photo-1583912267550-462a6819bfbb?w=600&h=400&fit=crop&q=80',
      qrCode: 'BG003',
      description: 'F1 pit stop action zone'
    },
    {
      type: 'background',
      name: 'Checkered Flag Zone',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop&q=80',
      qrCode: 'BG004',
      description: 'Victory finish line atmosphere'
    },
    {
      type: 'background',
      name: 'Victory Podium',
      imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=600&h=400&fit=crop&q=80',
      qrCode: 'BG005',
      description: 'Championship celebration podium'
    },
    // Character Stamps - F1 Alpine Racing Elements (5)
    {
      type: 'character',
      name: 'Alpine F1 Car',
      imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=400&h=500&fit=crop&q=80',
      qrCode: 'CH001',
      description: 'Alpine A523 Formula 1 racing machine'
    },
    {
      type: 'character',
      name: 'F1 Racing Helmet',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=500&fit=crop&q=80',
      qrCode: 'CH002',
      description: 'Professional F1 driver helmet'
    },
    {
      type: 'character',
      name: 'BlockDAG x Alpine',
      imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=500&fit=crop&q=80',
      qrCode: 'CH003',
      description: 'Official partnership logo'
    },
    {
      type: 'character',
      name: 'Championship Trophy',
      imageUrl: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=400&h=500&fit=crop&q=80',
      qrCode: 'CH004',
      description: 'F1 World Championship trophy'
    },
    {
      type: 'character',
      name: 'Racing Number',
      imageUrl: 'https://images.unsplash.com/photo-1595726172945-e4f285e4e5fb?w=400&h=500&fit=crop&q=80',
      qrCode: 'CH005',
      description: 'Alpine team racing number badge'
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