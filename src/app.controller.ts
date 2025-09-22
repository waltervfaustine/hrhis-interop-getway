/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { Controller, Get } from '@nestjs/common';
// import { AppService } from './app.service';

// @Controller()
// export class AppController {
//   constructor(private readonly appService: AppService) {}

//   @Get()
//   getHello(): string {
//     return this.appService.getHello();
//   }
// }

// src/app.controller.ts
import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ChwService } from './features/chw/chw.service';
import { MESSAGE_TYPES } from './shared/domain.constants';

@Controller('v1/chw')
export class ChwController {
  constructor(private readonly chw: ChwService) {}

  private buildCtx(h: Record<string, string>) {
    return {
      user: h['x-forwarded-user'] ?? 'unknown',
      reqId: h['x-request-id'] ?? crypto.randomUUID(),
      ts: new Date().toISOString(),
    };
  }

  // Optional: a tiny helper so DHIS2 text/plain bodies still work
  private coerceJson<T = any>(body: any): T {
    if (typeof body === 'string') {
      try {
        return JSON.parse(body) as T;
      } catch {
        /* fall through */
      }
    }
    return body as T;
  }

  @Post('bank-update-request')
  @HttpCode(HttpStatus.OK)
  async bankUpdateRequest(@Body() raw: any, @Headers() h: any) {
    const body = this.coerceJson(raw);

    // Minimal guard (your DTO/pipe can be stricter)
    if (!body?.trackedEntity && !body?.message?.body) {
      return {
        status: 400,
        error: 'trackedEntity or message.body is required',
      };
    }

    // ⬇️ Await the whole workflow (build → sign → call → update → return)
    return await this.chw.run(
      MESSAGE_TYPES.CHW_BANK_UPDATE_REQUEST,
      body,
      this.buildCtx(h),
    );
  }
}
