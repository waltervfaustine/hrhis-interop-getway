/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
// src/features/chw/strategies/bank-update-request.strategy.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { Strategy, StrategyContext } from './base.strategy';
import {
  MESSAGE_TYPES,
  PROGRAMS,
  STAGES,
  DATA,
  HEADER,
  STATUS,
} from '../../../shared/domain.constants';
import { Dhis2Service } from '../../../shared/dhis2.service';
import { ExternalService } from '../../../shared/external.service';
import { SigningService } from '../../../shared/signing.service';
import { updateEventDataValues } from '../../../shared/util';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BankDetailsUpdateStrategy implements Strategy {
  code = MESSAGE_TYPES.CHW_BANK_UPDATE_REQUEST;

  constructor(
    private readonly dhis: Dhis2Service,
    private readonly ext: ExternalService,
    private readonly signer: SigningService,
  ) {}

  async handle(dto: any, ctx: StrategyContext) {
    const teiId = dto?.trackedEntity as string;
    if (!teiId) throw new BadRequestException('trackedEntity is required');

    // 1) Load TEI with program context
    const tei = await this.dhis.getTrackedEntity(
      teiId,
      PROGRAMS.CHW_EMPLOYMENT,
    );
    if (!tei) throw new BadRequestException('Tracked entity not found');

    // 2) Map TEI → minimal request body the external API expects to INITIATE a bank update (request)
    const payloadBody = this.buildBankUpdateRequestBody(tei);
    if (!payloadBody.length) {
      return {
        status: 200,
        payload: { message: 'No eligible CHW data to request update' },
      };
    }

    // 3) Wrap with header and sign
    const message = {
      header: {
        sender: HEADER.SENDER,
        receiver: HEADER.RECEIVER,
        messageType: this.code,
        messageId: `${HEADER.SENDER}-${uuidv4()}`,
        createdAt: ctx.timestamp.slice(0, 10),
      },
      body: payloadBody,
    };
    const jws = await this.signer.sign(message, ctx.dhisUser);

    // 4) Send to external API
    const { data, status } = await this.ext.postSigned(
      '/hrhis-chw-bank-update-request',
      { message, signature: jws },
      { jws, user: ctx.dhisUser, ts: ctx.timestamp, reqId: ctx.requestId },
    );

    // 5) (Optional) Mark a DHIS2 event to reflect the request was sent (success/fail info)
    await this.flagRequestStatus(tei, status, data);

    return { status, payload: data };
  }

  private buildBankUpdateRequestBody(tei: any) {
    // Typical minimal: who is the person + what we’re requesting (bank update)
    // Pull NIN & basic identifiers from attributes; program/event context if needed.
    const attrs = new Map<string, string>(
      (tei?.attributes || []).map((a: any) => [a.code, a.value]),
    );
    const nid = (attrs.get('NATIONAL_IDENTIFICATION_NUMBER') || '').replace(
      /-/g,
      '',
    );
    if (!nid) return [];

    return [
      {
        nationalIdentificationNumber: nid,
        requestType: 'BANK_DETAILS_UPDATE', // external contract—your spec here
        requestedBy: 'HRHIS', // or ctx.dhisUser if you want user attribution in body
      },
    ];
  }

  private async flagRequestStatus(tei: any, httpStatus: number, data: any) {
    const enrollment = (tei?.enrollments || [])[0] || {};
    const events: any[] = enrollment?.events || [];
    const pay = events.find((e) => e.programStage === STAGES.PAYMENT);
    if (!pay) return;

    const isOk = httpStatus >= 200 && httpStatus < 300;
    const updated = updateEventDataValues(pay, [
      {
        dataElement: DATA.TX_STATUS,
        value: isOk ? STATUS.SUCCESS : STATUS.FAILURE,
      },
      {
        dataElement: DATA.TX_REASON,
        value: isOk ? '' : data?.error || 'External request failed',
      },
    ]);
    await this.dhis.postTrackerEvents([updated]);
  }
}
