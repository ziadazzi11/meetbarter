import { Module, Global } from '@nestjs/common';
import { SystemStateService } from './system-state.service';
import { AutomationService } from './automation.service';


@Global()
@Module({
    providers: [SystemStateService, AutomationService],
    exports: [SystemStateService, AutomationService],
})
export class SystemStateModule { }
