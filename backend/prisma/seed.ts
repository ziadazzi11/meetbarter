import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // Standardized Categories per User Request (15% Flat Escrow)
    const electronics = await prisma.category.upsert({
        where: { name: 'Electronics' },
        update: {
            escrowPercentage: 15.0,
            description: 'Gadgets, appliances, hardware (Standard 15% Escrow)',
            minVP: 20,
            maxVP: 10000
        },
        create: {
            name: 'Electronics',
            description: 'Gadgets, appliances, hardware (Standard 15% Escrow)',
            minVP: 20,
            maxVP: 10000,
            escrowPercentage: 15.0,
        },
    });

    const hobbies = await prisma.category.upsert({
        where: { name: 'Hobbies' },
        update: {
            escrowPercentage: 15.0,
            description: 'Collectibles, sports gear, crafts (Standard 15% Escrow)',
            minVP: 5,
            maxVP: 5000
        },
        create: {
            name: 'Hobbies',
            description: 'Collectibles, sports gear, crafts (Standard 15% Escrow)',
            minVP: 5,
            maxVP: 5000,
            escrowPercentage: 15.0,
        },
    });

    const products = await prisma.category.upsert({
        where: { name: 'Home Goods' },
        update: {
            escrowPercentage: 15.0,
            description: 'Furniture, decor, kitchenware (Standard 15% Escrow)',
            minVP: 10,
            maxVP: 20000
        },
        create: {
            name: 'Home Goods',
            description: 'Furniture, decor, kitchenware (Standard 15% Escrow)',
            minVP: 10,
            maxVP: 20000,
            escrowPercentage: 15.0,
        },
    });

    const services = await prisma.category.upsert({
        where: { name: 'Services' },
        update: {
            escrowPercentage: 15.0,
            description: 'Technical skills, repairs, labor (Standard 15% Escrow)',
            minVP: 50,
            maxVP: 10000
        },
        create: {
            name: 'Services',
            description: 'Technical skills, repairs, labor (Standard 15% Escrow)',
            minVP: 50,
            maxVP: 10000,
            escrowPercentage: 15.0,
        },
    });

    // Standard Password
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create a Demo User
    await prisma.user.upsert({
        where: { email: 'demo@meetbarter.com' },
        update: { passwordHash },
        create: {
            email: 'demo@meetbarter.com',
            passwordHash,
            fullName: 'Demo Trader',
            role: 'USER',
            globalTrustScore: 1.5,
            walletBalance: 1000,
            phoneNumber: '+961 70 123456',
        },
    });

    // Create a Demo Seller
    const sellerUser = await prisma.user.upsert({
        where: { email: 'seller@meetbarter.com' },
        update: { passwordHash },
        create: {
            email: 'seller@meetbarter.com',
            passwordHash,
            fullName: 'Local Farmer',
            role: 'USER',
            walletBalance: 50,
            phoneNumber: '+961 03 654321',
        },
    });

    // Helper for AI Pricing logic in seed
    const calculateVP = (original: number, condition: string) => {
        let multiplier = 0.2;
        if (condition === 'NEW') multiplier = 0.6;
        else if (condition === 'USED_GOOD') multiplier = 0.3;
        return Math.round(original * multiplier);
    };

    const productList = [
        {
            title: 'Electric Solar Oven',
            description: 'Brand new high-efficiency solar cooker.',
            originalPrice: 500,
            condition: 'NEW',
            categoryId: electronics.id,
            images: '["solar_oven.jpg"]',
        },
        {
            title: 'Professional Mountain Bike',
            description: 'Used for one season, excellent condition.',
            originalPrice: 1200,
            condition: 'USED_GOOD',
            categoryId: hobbies.id,
            images: '["mountain_bike.jpg"]',
        },
        {
            title: 'Vintage Carpentry Set',
            description: 'Reliable old tools, well-maintained.',
            originalPrice: 300,
            condition: 'USED_GOOD',
            categoryId: products.id,
            images: '["carpentry_tools.jpg"]',
        },
        {
            title: 'Power Drill (Cordless)',
            description: 'Functional but has visible wear and tear.',
            originalPrice: 150,
            condition: 'USED_FAIR',
            categoryId: electronics.id,
            images: '["power_drill.jpg"]',
        },
        {
            title: 'Python Coding Workshop',
            description: 'Learn automation in 4 sessions.',
            originalPrice: 200,
            condition: 'NEW',
            categoryId: services.id,
            images: '["python_course.jpg"]',
        }
    ];

    // Clear old listings and trades to avoid duplicates and FK errors
    await prisma.trade.deleteMany({ where: { sellerId: sellerUser.id } });
    await prisma.listing.deleteMany({ where: { sellerId: sellerUser.id } });

    // Commented out to provide a clean slate for the user
    /*
    for (const p of productList) {
        await prisma.listing.create({
            data: {
                ...p,
                priceVP: calculateVP(p.originalPrice, p.condition),
                status: 'ACTIVE',
                location: 'Beirut',
                sellerId: sellerUser.id,
            }
        });
    }
    */

    // Create an Admin User
    await prisma.user.upsert({
        where: { email: 'admin@meetbarter.com' },
        update: { passwordHash },
        create: {
            email: 'admin@meetbarter.com',
            passwordHash,
            fullName: 'System Admin',
            role: 'ADMIN',
            walletBalance: 100000,
            phoneNumber: '+961 71 999999',
            verificationLevel: 3,
            isBusiness: true
        },
    });

    // v1.2: System Configuration (Phase 1 Baseline)
    await prisma.systemConfig.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            isFrozen: false,
            alphaCode: '2abwal2ibin', // Prototype Alpha
            betaCode: 'love one another',
            baseEscrowRate: 15,
            emergencyFundVP: 0,
            ambassadorFundVP: 0,
            adminFundVP: 0,
            isCrisisActive: true, // Lebanon context
        },
    });

    console.log('Seeding complete with AI Pricing logic and Phase 1 SystemConfig.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
