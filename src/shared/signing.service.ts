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
  // Prefer file (Docker secret mount)
  const p = process.env.PRIVATE_KEY_PATH;
  if (p) {
    const full = resolve(p);
    if (!existsSync(full))
      throw new Error(`PRIVATE_KEY_PATH not found: ${full}`);
    return readFileSync(full, 'utf8').trim();
  }
  // Fallback: inline env (escape newlines as \n)
  const raw = process.env.PRIVATE_KEY_PEM || '';
  if (!raw) throw new Error('Missing PRIVATE_KEY_PATH or PRIVATE_KEY_PEM');
  return (raw.includes('\\n') ? raw.replace(/\\n/g, '\n') : raw).trim();
}

function toKeyObject(pem: string): KeyObject {
  // Node parses both PKCS#1 & PKCS#8. No jose import* calls needed.
  return createPrivateKey(pem);
}

@Injectable()
export class SigningService {
  private keyPromise = (async () => toKeyObject(loadPem()))();

  async sign(payload: Record<string, any>, subject: string) {
    const key = await this.keyPromise; // Node KeyObject
    const now = Math.floor(Date.now() / 1000);
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(now + 60)
      .setIssuer('hrhis-interop-gateway')
      .setSubject(subject)
      .sign(key); // jose accepts a Node KeyObject
  }
}
