import { Injectable, InternalServerErrorException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

/**
 * v1.2: Local Vault Storage
 * Designed for $0 initial cost. Persists sensitive ID documents locally.
 * In a production environment, this should be swapped for an S3-compatible provider.
 */
@Injectable()
export class VaultStorageService {
    private readonly vaultDir = path.resolve(process.cwd(), 'vault_storage');

    constructor() {
        this.ensureVaultDirExists();
    }

    private ensureVaultDirExists() {
        if (!fs.existsSync(this.vaultDir)) {
            fs.mkdirSync(this.vaultDir, { recursive: true });
        }
    }

    async saveDocument(fileName: string, content: Buffer): Promise<string> {
        try {
            // Use a timestamp to avoid collisions in prototype phase
            const uniqueName = `${Date.now()}-${fileName}`;
            const filePath = path.join(this.vaultDir, uniqueName);
            await fs.promises.writeFile(filePath, content);
            return filePath;
        } catch (error) {
            throw new InternalServerErrorException('Failed to save document to vault');
        }
    }

    async getDocument(filePath: string): Promise<Buffer> {
        try {
            return await fs.promises.readFile(filePath);
        } catch (error) {
            throw new InternalServerErrorException('Failed to read document from vault');
        }
    }

    async deleteDocument(filePath: string): Promise<void> {
        try {
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        } catch (error) {
            // Log but don't throw for deletion errors in prototype
        }
    }

    async listAllDocuments(): Promise<string[]> {
        try {
            const files = await fs.promises.readdir(this.vaultDir);
            return files.map(file => path.join(this.vaultDir, file));
        } catch (error) {
            throw new InternalServerErrorException('Failed to list vault documents');
        }
    }
}
