/**
 * Copyright (c) 2026 Ziad Azzi. All Rights Reserved.
 * This software is proprietary and confidential.
 */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors(); // Allow requests from frontend (port 3000)
    await app.listen(3001);
}
bootstrap();
