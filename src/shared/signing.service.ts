/* eslint-disable @typescript-eslint/require-await */
// import { Injectable } from '@nestjs/common';
// import { importPKCS8, SignJWT } from 'jose';

// @Injectable()
// export class SigningService {
//   private keyPromise = importPKCS8(process.env.PRIVATE_KEY_PEM!, 'RS256');

//   async sign(payload: Record<string, any>, subject: string) {
//     const key = await this.keyPromise;
//     const now = Math.floor(Date.now() / 1000);
//     return await new SignJWT(payload)
//       .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
//       .setIssuedAt(now)
//       .setExpirationTime(now + 60)
//       .setIssuer('interop-gateway')
//       .setSubject(subject)
//       .sign(key);
//   }
// }
// src/shared/signing.service.ts
import { Injectable } from '@nestjs/common';
import { SignJWT } from 'jose';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { createPrivateKey, KeyObject } from 'crypto';

function loadPem(): string {
  const path = process.env.PRIVATE_KEY_PATH;
  if (path) {
    const full = resolve(path);
    if (!existsSync(full))
      throw new Error(`PRIVATE_KEY_PATH not found: ${full}`);
    return readFileSync(full, 'utf8').trim();
  }
  const raw = process.env.PRIVATE_KEY_PEM || '';
  if (!raw) throw new Error('Missing PRIVATE_KEY_PATH or PRIVATE_KEY_PEM');
  return (raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw).trim();
}

function toKeyObject(pem: string): KeyObject {
  // Handles PKCS#1 (BEGIN RSA PRIVATE KEY) and PKCS#8 (BEGIN PRIVATE KEY)
  return createPrivateKey(pem);
}

@Injectable()
export class SigningService {
  private keyPromise = (async () => toKeyObject(loadPem()))();

  async sign(payload: Record<string, any>, subject: string) {
    const key = await this.keyPromise;
    const now = Math.floor(Date.now() / 1000);
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(now + 60)
      .setIssuer('hrhis-interop-gateway')
      .setSubject(subject)
      .sign(key);
  }
}
