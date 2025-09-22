/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/features/chw/chw.controller.ts
import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ChwService } from './chw.service';
import { MESSAGE_TYPES } from '../../shared/domain.constants';
import { Dhis2RouteGuard } from 'src/core/guards/dhis2.route.guard';

@UseGuards(Dhis2RouteGuard)
@Controller('v1/chw')
export class ChwController {
  constructor(private readonly chw: ChwService) {}

  private buildCtx(headers: any) {
    return {
      dhisUser: headers['x-forwarded-user'] as string,
      requestId: (headers['x-request-id'] as string) || uuidv4(),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('new-registration')
  @HttpCode(HttpStatus.OK)
  newRegistration(@Body() body: any, @Headers() h: any) {
    return this.chw.run(
      MESSAGE_TYPES.NEW_CHW_REGISTRATION,
      body,
      this.buildCtx(h),
    );
  }

  @Post('contract-status-request')
  @HttpCode(HttpStatus.OK)
  contractStatus(@Body() body: any, @Headers() h: any) {
    return this.chw.run(
      MESSAGE_TYPES.CHW_CONTRACT_STATUS_REQUEST,
      body,
      this.buildCtx(h),
    );
  }

  @Post('deployment')
  @HttpCode(HttpStatus.OK)
  deployment(@Body() body: any, @Headers() h: any) {
    return this.chw.run(MESSAGE_TYPES.CHW_DEPLOYMENT, body, this.buildCtx(h));
  }

  @Post('duty-post-change')
  @HttpCode(HttpStatus.OK)
  dutyPostChange(@Body() body: any, @Headers() h: any) {
    return this.chw.run(
      MESSAGE_TYPES.CHW_DUTY_POST_CHANGE,
      body,
      this.buildCtx(h),
    );
  }

  @Post('demographic-update')
  @HttpCode(HttpStatus.OK)
  demographicUpdate(@Body() body: any, @Headers() h: any) {
    return this.chw.run(
      MESSAGE_TYPES.CHW_DEMOGRAPHIC_UPDATE,
      body,
      this.buildCtx(h),
    );
  }

  @Post('bank-details-update')
  @HttpCode(HttpStatus.OK)
  bankDetailsUpdate(@Body() body: any, @Headers() h: any) {
    return this.chw.run(
      MESSAGE_TYPES.CHW_BANK_DETAILS_UPDATE,
      body,
      this.buildCtx(h),
    );
  }

  @Post('bank-update-request')
  @HttpCode(HttpStatus.OK)
  bankUpdateRequest(@Body() body: any, @Headers() h: any) {
    return this.chw.run(
      MESSAGE_TYPES.CHW_BANK_UPDATE_REQUEST,
      body,
      this.buildCtx(h),
    );
  }

  @Post('update-request')
  @HttpCode(HttpStatus.OK)
  updateRequest(@Body() body: any, @Headers() h: any) {
    return this.chw.run(
      MESSAGE_TYPES.CHW_UPDATE_REQUEST,
      body,
      this.buildCtx(h),
    );
  }
}
