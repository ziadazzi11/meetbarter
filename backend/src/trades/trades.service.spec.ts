import { Test, TestingModule } from '@nestjs/testing';
import { TradesService } from './trades.service';
import { PrismaService } from '../prisma/prisma.service';
import { TimelineService } from '../timeline/timeline.service';
import { SecurityService } from '../security/security.service';
import { NotificationsGateway } from '../notifications/notifications.gateway';
import { ForensicLoggingService } from '../security/forensic-logging.service';

import { AutomationService } from '../system-state/automation.service';

describe('TradesService', () => {
  let service: TradesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TradesService,
        { provide: PrismaService, useValue: {} },
        { provide: TimelineService, useValue: {} },
        { provide: SecurityService, useValue: {} },
        { provide: NotificationsGateway, useValue: {} },
        { provide: ForensicLoggingService, useValue: {} },
        { provide: AutomationService, useValue: { reportEvent: jest.fn() } },
      ],
    }).compile();

    service = module.get<TradesService>(TradesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
