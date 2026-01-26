/**
 * Copyright (c) 2026 Ziad Azzi. All Rights Reserved.
 * This software is proprietary and confidential.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 🛡️ Security: Helmet for HTTP Headers (Anti-XSS, Anti-Sniffing)
    app.use(helmet());

    // 🛡️ Security: Strict CORS
    app.enableCors({
        origin: ['http://localhost:3000'], // Only allow our frontend
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });

    // 🛡️ Security: Validation Pipe (Strip malicious/extra properties)
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // Remove properties not in DTO
        forbidNonWhitelisted: true, // Throw error if extra properties sent
        transform: true, // Auto-convert types
    }));

    await app.listen(3001);
}
bootstrap();
