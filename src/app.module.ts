// features/chw/chw.module.ts
import { Module } from '@nestjs/common';
import { ChwController } from './app.controller';
import { ChwService } from './features/chw/chw.service';
import { SigningService } from './shared/signing.service';
import { ExternalService } from './shared/external.service';
import { Dhis2Service } from './shared/dhis2.service';

// import { CHW_STRATEGIES } from '../../shared/tokens'; // if you use a custom token
// ... strategy classes & factory provider for CHW_STRATEGIES

@Module({
  controllers: [ChwController],
  providers: [
    ChwService,
    SigningService,
    ExternalService,
    Dhis2Service,
    // { provide: CHW_STRATEGIES, useFactory: (...strategies) => map, inject: [...] }
  ],
  exports: [ChwService], // only if other modules need it
})
export class ChwModule {}
