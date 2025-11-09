const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Use simple, reliable placeholder images
    const placeholderBase = 'https://placehold.co/600x400';

    // Background stamps
    const backgrounds = [
        {
            type: 'background',
            name: 'Monaco Grand Prix',
            imageUrl: `${placeholderBase}/667eea/white?text=Monaco+Grand+Prix`,
            qrCode: 'BG001',
            description: 'Legendary Monaco street circuit'
        },
        {
            type: 'background',
            name: 'Racing Circuit',
            imageUrl: `${placeholderBase}/764ba2/white?text=Racing+Circuit`,
            qrCode: 'BG002',
            description: 'Modern F1 racing track'
        },
        {
            type: 'background',
            name: 'Pit Lane',
            imageUrl: `${placeholderBase}/f093fb/white?text=Pit+Lane`,
            qrCode: 'BG003',
            description: 'Behind the scenes action'
        },
        {
            type: 'background',
            name: 'Victory Podium',
            imageUrl: `${placeholderBase}/4facfe/white?text=Victory+Podium`,
            qrCode: 'BG004',
            description: 'Celebrate your victory'
        },
        {
            type: 'background',
            name: 'Night Race',
            imageUrl: `${placeholderBase}/667eea/white?text=Night+Race`,
            qrCode: 'BG005',
            description: 'Under the lights'
        }
    ];

    // Character stamps
    const characters = [
        {
            type: 'character',
            name: 'F1 Racing Car',
            imageUrl: `${placeholderBase}/ff6b6b/white?text=F1+Racing+Car`,
            qrCode: 'CH001',
            description: 'Alpine F1 Team car'
        },
        {
            type: 'character',
            name: 'Racing Helmet',
            imageUrl: `${placeholderBase}/4caf50/white?text=Racing+Helmet`,
            qrCode: 'CH002',
            description: 'Driver safety equipment'
        },
        {
            type: 'character',
            name: 'Alpine Logo',
            imageUrl: `${placeholderBase}/2196f3/white?text=Alpine+Logo`,
            qrCode: 'CH003',
            description: 'Official team logo'
        },
        {
            type: 'character',
            name: 'Trophy',
            imageUrl: `${placeholderBase}/ffc107/white?text=Trophy`,
            qrCode: 'CH004',
            description: 'Championship trophy'
        },
        {
            type: 'character',
            name: 'Checkered Flag',
            imageUrl: `${placeholderBase}/9c27b0/white?text=Checkered+Flag`,
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