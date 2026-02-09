import { Injectable, CanActivate, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SystemFreezeGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(): Promise<boolean> {
        const config = await this.prisma.systemConfig.findFirst();
        if (config?.isFrozen) {
            throw new ServiceUnavailableException('The system is currently frozen for maintenance or security review.');
        }
        return true;
    }
}
