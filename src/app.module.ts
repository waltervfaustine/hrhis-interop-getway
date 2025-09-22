/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { ChwController } from './app.controller';
import { AppService } from './app.service';
import { ChwModule } from './features/chw/chw.module';
import { ConfigModule } from '@nestjs/config';
import { SigningService } from './shared/signing.service';
import { ExternalService } from './shared/external.service';
import { Dhis2Service } from './shared/dhis2.service';
import { ChwService } from './features/chw/chw.service';

@Module({
  imports: [ChwModule, ConfigModule.forRoot({ isGlobal: true })],
  controllers: [ChwController],
  providers: [
    AppService,
    ChwService,
    SigningService,
    ExternalService,
    Dhis2Service,
  ],
})
export class AppModule {}
