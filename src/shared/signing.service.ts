/* eslint-disable @typescript-eslint/require-await */
// src/shared/signing.service.ts
import { Injectable } from '@nestjs/common';
import { SignJWT } from 'jose';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createPrivateKey } from 'crypto';

function loadPem(): string {
  const p = process.env.PRIVATE_KEY_PATH;
  if (p) {
    const full = resolve(p);
    if (!existsSync(full))
      throw new Error(`PRIVATE_KEY_PATH not found: ${full}`);
    return readFileSync(full, 'utf8').trim();
  }
  const pem = process.env.PRIVATE_KEY_PEM;
  if (pem)
    return (pem.includes('\\n') ? pem.replace(/\\n/g, '\n') : pem).trim();
  throw new Error(
    'Missing PRIVATE_KEY_PATH (file) or PRIVATE_KEY_PEM (inline)',
  );
}

@Injectable()
export class SigningService {
  private keyPromise = (async () => createPrivateKey(loadPem()))();
  async sign(payload: Record<string, any>, subject: string) {
    const key = await this.keyPromise;
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('60s')
      .setIssuer('hrhis-interop-gateway')
      .setSubject(subject)
      .sign(key);
  }
}
