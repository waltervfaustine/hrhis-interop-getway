/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { dhisClient, withRetry } from './http';

function authHeader() {
  const u = process.env.DHIS2_USERNAME!;
  const p = process.env.DHIS2_PASSWORD!;
  return {
    Authorization: 'Basic ' + Buffer.from(`${u}:${p}`).toString('base64'),
  };
}

@Injectable()
export class Dhis2Service {
  async getTrackedEntity(teiId: string, programId: string) {
    const url = `/api/tracker/trackedEntities/${teiId}?program=${programId}&fields=*`;
    const { data } = await withRetry(() =>
      dhisClient.get(url, { headers: authHeader() }),
    );
    return data;
  }

  async postTrackerEvents(events: any[]) {
    const url = `/api/tracker?async=false&importStrategy=CREATE_AND_UPDATE`;
    const { data } = await withRetry(() =>
      dhisClient.post(
        url,
        { events },
        { headers: { ...authHeader(), 'Content-Type': 'application/json' } },
      ),
    );
    return data;
  }

  async fetchDataElementsByCodes(codes: string[]) {
    const filter = `code:in:[${codes.join(',')}]`;
    const { data } = await withRetry(() =>
      dhisClient.get(`/api/dataElements?filter=${filter}&fields=id,code`, {
        headers: authHeader(),
      }),
    );
    return data?.dataElements ?? [];
  }
}
