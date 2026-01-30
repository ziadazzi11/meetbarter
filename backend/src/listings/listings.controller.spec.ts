import { Test, TestingModule } from '@nestjs/testing';
import { ListingsController } from './listings.controller';
import { ListingsService } from './listings.service';

import { ContentModerationGuard } from '../common/guards/content-moderation.guard';

import { SystemStateService } from '../system-state/system-state.service';

describe('ListingsController', () => {
  let controller: ListingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListingsController],
      providers: [
        {
          provide: ListingsService,
          useValue: {
            findAll: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            search: jest.fn(),
            findMyListings: jest.fn(),
          }
        },
        {
          provide: SystemStateService,
          useValue: {
            getKillSwitches: jest.fn(() => ({ disableUploads: false })),
          }
        }
      ],
    })
      .overrideGuard(ContentModerationGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<ListingsController>(ListingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
