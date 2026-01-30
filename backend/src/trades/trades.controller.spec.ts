import { Test, TestingModule } from '@nestjs/testing';
import { TradesController } from './trades.controller';
import { TradesService } from './trades.service';

import { SystemFreezeGuard } from '../common/guards/system-freeze.guard';

import { SystemStateService } from '../system-state/system-state.service';

describe('TradesController', () => {
  let controller: TradesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TradesController],
      providers: [
        {
          provide: TradesService,
          useValue: {
            createTrade: jest.fn(),
            confirm: jest.fn(),
            findAll: jest.fn(),
            getTrade: jest.fn(),
            disputeTrade: jest.fn(),
            addCashSweetener: jest.fn(),
          },
        },
        {
          provide: SystemStateService,
          useValue: {
            getKillSwitches: jest.fn(() => ({ disableTrades: false })),
          }
        }
      ],
    })
      .overrideGuard(SystemFreezeGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<TradesController>(TradesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
