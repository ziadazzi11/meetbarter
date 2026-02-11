import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect();
        // 🚀 SQLITE PERFORMANCE HARDENING (Section 5.1)
        try {
            await this.$executeRawUnsafe('PRAGMA journal_mode = WAL;');
            await this.$executeRawUnsafe('PRAGMA synchronous = NORMAL;');
            await this.$executeRawUnsafe('PRAGMA temp_store = MEMORY;');
            // await this.$executeRawUnsafe('PRAGMA mmap_size = 30000000000;'); // Reduced for local stability
            await this.$executeRawUnsafe('PRAGMA mmap_size = 268435456;'); // 256MB is safe
            await this.$executeRawUnsafe('PRAGMA cache_size = -200000;');
            console.log('✅ SQLite Performance PRAGMAs Applied');
        } catch (error) {
            console.error('⚠️ Failed to apply SQLite PRAGMAs:', error);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
