// src/features/chw/chw.module.ts
import { Module } from '@nestjs/common';
import { Dhis2Service } from '../../shared/dhis2.service';
import { ExternalService } from '../../shared/external.service';
import { SigningService } from '../../shared/signing.service';
import { ChwController } from './chw.controller';
import { ChwService } from './chw.service';
import { CHW_STRATEGIES } from './strategies/strategy.tokens';

// all your strategies
import { BankDetailsUpdateStrategy } from './strategies/bank-details-update.strategy';
// import { BankUpdateRequestStrategy } from './strategies/bank-update-request.strategy';
// import { NewRegistrationStrategy } from './strategies/new-registration.strategy';
// import { ContractStatusRequestStrategy } from './strategies/contract-status-request.strategy';
// import { DeploymentStrategy } from './strategies/deployment.strategy';
// import { DutyPostChangeStrategy } from './strategies/duty-post-change.strategy';
// import { DemographicUpdateStrategy } from './strategies/demographic-update.strategy';
// import { UpdateRequestStrategy } from './strategies/update-request.strategy';

@Module({
  controllers: [ChwController],
  providers: [
    // shared services
    Dhis2Service,
    ExternalService,
    SigningService,

    // register each strategy so Nest can instantiate them
    BankDetailsUpdateStrategy,
    // BankUpdateRequestStrategy,
    // NewRegistrationStrategy,
    // ContractStatusRequestStrategy,
    // DeploymentStrategy,
    // DutyPostChangeStrategy,
    // DemographicUpdateStrategy,
    // UpdateRequestStrategy,

    // aggregate into an array using a factory + inject the instances above
    {
      provide: CHW_STRATEGIES,
      useFactory: (
        bankDetails: BankDetailsUpdateStrategy,
        // bankUpdateReq: BankUpdateRequestStrategy,
        // registration: NewRegistrationStrategy,
        // contractStatus: ContractStatusRequestStrategy,
        // deployment: DeploymentStrategy,
        // dutyPost: DutyPostChangeStrategy,
        // demographic: DemographicUpdateStrategy,
        // updateReq: UpdateRequestStrategy,
      ) => [
        bankDetails,
        // bankUpdateReq,
        // registration,
        // contractStatus,
        // deployment,
        // dutyPost,
        // demographic,
        // updateReq,
      ],
      inject: [
        BankDetailsUpdateStrategy,
        // BankUpdateRequestStrategy,
        // NewRegistrationStrategy,
        // ContractStatusRequestStrategy,
        // DeploymentStrategy,
        // DutyPostChangeStrategy,
        // DemographicUpdateStrategy,
        // UpdateRequestStrategy,
      ],
    },
    // ChwService consumes the array
    ChwService,
  ],
})
export class ChwModule {}
