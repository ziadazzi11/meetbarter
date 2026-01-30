import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { SecureUploadController } from './secure-upload.controller';
import { SecureUploadService } from './secure-upload.service';

@Module({
    controllers: [SecureUploadController],
    providers: [CloudinaryService, SecureUploadService],
    exports: [CloudinaryService, SecureUploadService],
})
export class UploadModule { }
