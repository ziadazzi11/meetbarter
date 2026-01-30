import { Module, Global } from '@nestjs/common';
import { IntelligenceService } from './intelligence.service';

import { SearchSecurityService } from './search-security.service';

@Global()
@Module({
    providers: [IntelligenceService, SearchSecurityService],
    exports: [IntelligenceService, SearchSecurityService],
})
export class IntelligenceModule { }
