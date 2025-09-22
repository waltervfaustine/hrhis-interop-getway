/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable prettier/prettier */
import axios from 'axios';

const timeout = Number(process.env.HTTP_TIMEOUT_MS || 8000);

export const dhisClient = axios.create({
  baseURL: process.env.DHIS2_BASE_URL,
  timeout,
});

export const externalClient = axios.create({
  baseURL: process.env.EXTERNAL_BASE_URL,
  timeout,
});

export async function withRetry<T>(fn: () => Promise<T>, retries = 2) {
  let err: any;
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (e) {
      err = e;
      await new Promise((r) => setTimeout(r, 300 * (i + 1)));
    }
  }
  throw err;
}
