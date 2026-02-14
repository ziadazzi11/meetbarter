import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import { PrismaModule } from '../prisma/prisma.module';
import { SecurityModule } from '../security/security.module';

import { MfaService } from './mfa.service';
import { OtpService } from './otp.service';

import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';

@Module({
    imports: [
        PrismaModule,
        PassportModule,
        SecurityModule,
        JwtModule.register({
            secret: jwtConstants.secret,
            signOptions: { expiresIn: '60m' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, MfaService, OtpService, GoogleStrategy, FacebookStrategy],
    exports: [AuthService, JwtModule, MfaService, OtpService],
})
export class AuthModule { }

