import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, BadRequestException, Request } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SecureUploadService } from './secure-upload.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { BannedUserGuard } from '../common/guards/banned-user.guard';

@Controller('upload/secure')
@UseGuards(ThrottlerGuard, JwtAuthGuard, BannedUserGuard)
export class SecureUploadController {
    constructor(private readonly secureUploadService: SecureUploadService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB Hard Limit (Blueprint Requirement)
        }
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File, @Request() req) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const secureUrl = await this.secureUploadService.processUpload(file, req.user.userId);

        return {
            status: 'success',
            url: secureUrl,
            protection: 'MAX_SECURE'
        };
    }
}
