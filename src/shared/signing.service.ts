import { Injectable } from '@nestjs/common';
import { importPKCS8, SignJWT } from 'jose';

@Injectable()
export class SigningService {
  private keyPromise = importPKCS8(process.env.PRIVATE_KEY_PEM!, 'RS256');

  async sign(payload: Record<string, any>, subject: string) {
    const key = await this.keyPromise;
    const now = Math.floor(Date.now() / 1000);
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
      .setIssuedAt(now)
      .setExpirationTime(now + 60)
      .setIssuer('interop-gateway')
      .setSubject(subject)
      .sign(key);
  }
}
