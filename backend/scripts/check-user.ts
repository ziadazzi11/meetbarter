
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'seller@meetbarter.com';
    console.log(`Checking for user: ${email}`);
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (user) {
        console.log(`User found: ${user.id}`);
        console.log(`Password Hash: ${user.passwordHash ? 'Present' : 'Missing'}`);
    } else {
        console.log('User NOT found.');
    }

    const demoUser = await prisma.user.findUnique({
        where: { email: 'demo@meetbarter.com' }
    });

    if (demoUser) {
        console.log(`Demo User found: ${demoUser.id}`);
    } else {
        console.log('Demo User NOT found.');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
