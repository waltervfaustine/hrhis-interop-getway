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
import { AxiosError } from 'axios';
import { buildExternalAuth } from './external-auth';

@Injectable()
export class ExternalService {
  async postSigned(
    path: string,
    payload: any,
    meta: { jws: string; user: string; ts: string; reqId: string },
  ) {
    const auth = await buildExternalAuth(path);
    const headers = {
      'Content-Type': 'application/json',
      'X-Request-Id': meta.reqId,
      'X-Timestamp': meta.ts,
      'X-DHIS2-User': meta.user,
      'X-Payload-Signature': meta.jws,
      ...auth.headers,
    };

    try {
      const res = await externalClient.post(path, payload, {
        headers,
        params: auth.query,
        // Let us inspect non-2xx instead of throwing
        validateStatus: () => true,
      });

      // Pass through the upstream status and body
      return { status: res.status, data: res.data };
    } catch (e) {
      const err = e as AxiosError;
      const status = err.response?.status ?? 502;
      const data = err.response?.data ?? { error: err.message };
      // Re-throw in your controller as HttpException(status, data) or return shape your app expects
      return { status, data };
    }
  }
}
