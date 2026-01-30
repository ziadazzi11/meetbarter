import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';

import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            findMe: jest.fn(),
            updateProfile: jest.fn(),
            requestBusinessVerification: jest.fn(),
            submitBusinessLicense: jest.fn(),
            requestCommunityVerification: jest.fn(),
            findPendingBusinesses: jest.fn(),
            findPendingCommunityVerifications: jest.fn(),
            findPendingAmbassadors: jest.fn(),
            approveAmbassador: jest.fn(),
            applyForAmbassador: jest.fn(),
            approveBusiness: jest.fn(),
            approveCommunityRequest: jest.fn(),
            upgradeSubscription: jest.fn(),
            socialLogin: jest.fn(),
          }
        }
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
