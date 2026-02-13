/**
 * Copyright (c) 2026 Ziad Azzi. All Rights Reserved.
 * This software is proprietary and confidential.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

import { HeaderDeceptionMiddleware } from './ads/recon/header-deception.middleware';
import { ShadowbanFilter } from './common/filters/shadowban.filter';
// Note: ShadowbanGuard cannot be global here because it needs DI (Prisma). 
// We will register it in AppModule or use a global module with APP_GUARD.

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 🛡️ Security: Helmet for HTTP Headers (Anti-XSS, Anti-Sniffing)
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", "data:", "https:"],
                connectSrc: ["'self'"],
            },
        },
        crossOriginEmbedderPolicy: false,
    }));

    // 🛡️ Security: Strict CORS
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    app.enableCors({
        origin: [frontendUrl, 'https://meetbarter.com', 'https://www.meetbarter.com', 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // 🛡️ Security: Validation Pipe (Strip malicious/extra properties)
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // Remove properties not in DTO
        forbidNonWhitelisted: true, // Throw error if extra properties sent
        transform: true, // Auto-convert types
    }));

    // 🛡️ ADS Phase II: Anti-Reconnaissance Layer


    // 🛡️ ADS Phase III: Shadowban Protocol
    app.useGlobalFilters(new ShadowbanFilter());

    // Header Deception (Functional Wrapper for Middleware)
    const deceptionMiddleware = new HeaderDeceptionMiddleware();
    app.use((req, res, next) => deceptionMiddleware.use(req, res, next));

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
