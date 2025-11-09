const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Use Unsplash F1/Racing themed images
    const backgrounds = [
        {
            type: 'background',
            name: 'Monaco Grand Prix',
            imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=400&fit=crop',
            qrCode: 'BG001',
            description: 'Legendary Monaco street circuit'
        },
        {
            type: 'background',
            name: 'Racing Circuit',
            imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600&h=400&fit=crop',
            qrCode: 'BG002',
            description: 'Modern F1 racing track'
        },
        {
            type: 'background',
            name: 'Pit Lane',
            imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=400&fit=crop',
            qrCode: 'BG003',
            description: 'Behind the scenes action'
        },
        {
            type: 'background',
            name: 'Victory Podium',
            imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop',
            qrCode: 'BG004',
            description: 'Celebrate your victory'
        },
        {
            type: 'background',
            name: 'Night Race',
            imageUrl: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=600&h=400&fit=crop',
            qrCode: 'BG005',
            description: 'Under the lights'
        }
    ];

    // Character stamps - F1 related
    const characters = [
        {
            type: 'character',
            name: 'F1 Racing Car',
            imageUrl: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&h=400&fit=crop',
            qrCode: 'CH001',
            description: 'Alpine F1 Team car'
        },
        {
            type: 'character',
            name: 'Racing Helmet',
            imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop',
            qrCode: 'CH002',
            description: 'Driver safety equipment'
        },
        {
            type: 'character',
            name: 'Alpine Logo',
            imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&h=400&fit=crop',
            qrCode: 'CH003',
            description: 'Official team logo'
        },
        {
            type: 'character',
            name: 'Trophy',
            imageUrl: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=400&h=400&fit=crop',
            qrCode: 'CH004',
            description: 'Championship trophy'
        },
        {
            type: 'character',
            name: 'Checkered Flag',
            imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=400&fit=crop',
            qrCode: 'CH005',
            description: 'Race finish symbol'
        }
    ];

    // Create or update stamps
    for (const stampData of [...backgrounds, ...characters]) {
        const stamp = await prisma.stamp.upsert({
            where: { qrCode: stampData.qrCode },
            update: stampData,
            create: stampData
        });
        console.log(`✓ Created stamp: ${stamp.name} (${stamp.qrCode})`);
    }

    console.log('✅ Seeding completed!');
}

main()
    .catch((e) => {
        console.error('Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });