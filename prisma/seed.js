const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  const stamps = [
    // Background Stamps - F1 Racing Tracks & Scenes (5)
    {
      type: 'background',
      name: 'Monaco Circuit',
      imageUrl: 'https://images.unsplash.com/photo-1532906619279-a4b7267faa66?w=400&h=300&fit=crop',
      qrCode: 'BG001',
      description: 'Iconic street circuit of Monaco'
    },
    {
      type: 'background',
      name: 'Silverstone Track',
      imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400&h=300&fit=crop',
      qrCode: 'BG002',
      description: 'Historic British Grand Prix circuit'
    },
    {
      type: 'background',
      name: 'Pit Lane',
      imageUrl: 'https://images.unsplash.com/photo-1583912267550-462a6819bfbb?w=400&h=300&fit=crop',
      qrCode: 'BG003',
      description: 'F1 pit lane action'
    },
    {
      type: 'background',
      name: 'Racing Garage',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
      qrCode: 'BG004',
      description: 'Behind the scenes in F1 garage'
    },
    {
      type: 'background',
      name: 'Victory Podium',
      imageUrl: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=400&h=300&fit=crop',
      qrCode: 'BG005',
      description: 'Championship celebration podium'
    },
    // Character Stamps - F1 Alpine Racing Elements (5)
    {
      type: 'character',
      name: 'Alpine A523 Car',
      imageUrl: 'https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=300&h=400&fit=crop',
      qrCode: 'CH001',
      description: 'Alpine F1 racing car'
    },
    {
      type: 'character',
      name: 'Racing Helmet',
      imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300&h=400&fit=crop',
      qrCode: 'CH002',
      description: 'F1 driver helmet'
    },
    {
      type: 'character',
      name: 'BlockDAG Logo',
      imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=300&h=400&fit=crop',
      qrCode: 'CH003',
      description: 'BlockDAG blockchain technology'
    },
    {
      type: 'character',
      name: 'Racing Trophy',
      imageUrl: 'https://images.unsplash.com/photo-1593941707874-ef25b8b4a92b?w=300&h=400&fit=crop',
      qrCode: 'CH004',
      description: 'F1 championship trophy'
    },
    {
      type: 'character',
      name: 'Checkered Flag',
      imageUrl: 'https://images.unsplash.com/photo-1595726172945-e4f285e4e5fb?w=300&h=400&fit=crop',
      qrCode: 'CH005',
      description: 'Victory checkered flag'
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