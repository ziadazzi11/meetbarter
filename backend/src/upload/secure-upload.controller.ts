import { Controller, Post, UploadedFile, UseInterceptors, UseGuards, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SecureUploadService } from './secure-upload.service';
import { ThrottlerGuard } from '@nestjs/throttler';
// import { AuthGuard } from '@nestjs/passport'; // In a real app, this would be guarded.

@Controller('upload/secure')
@UseGuards(ThrottlerGuard) // basic denial of service protection
export class SecureUploadController {
    constructor(private readonly secureUploadService: SecureUploadService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file', {
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB Hard Limit (Blueprint Requirement)
        }
    }))
    async uploadFile(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const secureUrl = await this.secureUploadService.processUpload(file);

        return {
            status: 'success',
            url: secureUrl,
            protection: 'MAX_SECURE'
        };
    }
}
