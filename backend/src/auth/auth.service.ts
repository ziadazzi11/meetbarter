import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { SecurityService } from '../security/security.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private security: SecurityService
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(pass, user.passwordHash))) {
            const { passwordHash, ...result } = user;
            return result;
        }
        return null; // Don't log failure here to avoid spamming logs on brute force, handled by assessAndLog in login/controller if needed, or rely on successful login logs + velocity checks.
    }

    async login(user: any) {
        // 🛡️ Security Hook: Login Risk Assessment
        await this.security.assessAndLog(user.id, {
            action: 'LOGIN_ATTEMPT',
            userId: user.id,
            details: { email: user.email, role: user.role }
        });

        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role
            }
        };
    }

    async register(data: any) {
        // Check for existing user first to avoid error spam? (Optional, let Prisma handle uniquness)

        const hashedPassword = await bcrypt.hash(data.password, 10);

        // 🛡️ Security Hook: Pre-Signup Risk Check (e.g. limit signups from same IP)
        // We don't have a userId yet, so we might pass a temporary identifier or IP if available in context.
        // For now, we log AFTER creation which is safer for ID tracking.

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                passwordHash: hashedPassword,
                fullName: data.fullName,
                country: data.country || 'Lebanon'
            }
        });

        // 🛡️ Security Hook: Signup Event
        await this.security.assessAndLog(user.id, {
            action: 'SIGNUP_ATTEMPT',
            userId: user.id,
            details: { email: data.email, country: data.country }
        });

        const { passwordHash, ...result } = user;
        return result;
    }
}
