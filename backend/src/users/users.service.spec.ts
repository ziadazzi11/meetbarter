import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../prisma/prisma.service';
import { SecurityService } from '../security/security.service';
import { EncryptionService } from '../security/encryption.service';
import { VaultStorageService } from '../security/vault-storage.service';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: { user: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() }, businessLicense: { upsert: jest.fn(), findMany: jest.fn() }, trade: { count: jest.fn(), findMany: jest.fn() }, $transaction: jest.fn() } },
        { provide: SecurityService, useValue: { assessAndLog: jest.fn() } },
        { provide: EncryptionService, useValue: { encrypt: jest.fn(), decrypt: jest.fn() } },
        { provide: VaultStorageService, useValue: {} },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
