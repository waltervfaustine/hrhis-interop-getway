/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
// /* eslint-disable @typescript-eslint/no-unsafe-assignment */
// import { Injectable } from '@nestjs/common';
// import { externalClient, withRetry } from './http';

// @Injectable()
// export class ExternalService {
//   async postSigned(
//     path: string,
//     body: any,
//     meta: { jws: string; user: string; ts: string; reqId: string },
//   ) {
//     const headers = {
//       'Content-Type': 'application/json',
//       'X-Request-Id': meta.reqId,
//       'X-Timestamp': meta.ts,
//       'X-DHIS2-User': meta.user,
//       'X-Payload-Signature': meta.jws,
//     };
//     const { data, status } = await withRetry(() =>
//       externalClient.post(path, body, { headers, validateStatus: () => true }),
//     );
//     return { data, status };
//   }
// }

// src/shared/external.service.ts
import { Injectable } from '@nestjs/common';
import { externalClient } from './http';
import { buildExternalAuth } from './external-auth';
import { AxiosError } from 'axios';

@Injectable()
export class ExternalService {
  async postSigned(
    path: string,
    payload: any,
    meta: { jws: string; user: string; ts: string; reqId: string },
  ) {
    const auth = await buildExternalAuth(path);

    console.log("REACHED SUCCESSFULLY");

    try {
      const res = await externalClient.post(path, payload, {
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': meta.reqId,
          'X-Timestamp': meta.ts,
          'X-DHIS2-User': meta.user,
          'X-Payload-Signature': meta.jws,
          ...auth.headers,
        },
        params: auth.query,
        validateStatus: () => true, // don't throw on 4xx/5xx
      });
      return { status: res.status, data: res.data };
    } catch (e) {
      const err = e as AxiosError;
      return {
        status: err.response?.status ?? 502,
        data: err.response?.data ?? { error: err.message },
      };
    }
  }
}
