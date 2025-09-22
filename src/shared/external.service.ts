/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { externalClient, withRetry } from './http';

@Injectable()
export class ExternalService {
  async postSigned(
    path: string,
    body: any,
    meta: { jws: string; user: string; ts: string; reqId: string },
  ) {
    const headers = {
      'Content-Type': 'application/json',
      'X-Request-Id': meta.reqId,
      'X-Timestamp': meta.ts,
      'X-DHIS2-User': meta.user,
      'X-Payload-Signature': meta.jws,
    };
    const { data, status } = await withRetry(() =>
      externalClient.post(path, body, { headers, validateStatus: () => true }),
    );
    return { data, status };
  }
}
