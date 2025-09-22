/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  CanActivate,
  ExecutionContext,
  BadRequestException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class Dhis2RouteGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    const headers = req.headers || {};
    const dhisUser = headers['x-forwarded-user'] as string | undefined;
    if (!dhisUser) throw new BadRequestException('Missing X-Forwarded-User');

    const pins = (process.env.ALLOWED_FORWARDERS || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    if (pins.length) {
      const host = (headers['x-forwarded-host'] ||
        headers['origin'] ||
        headers['host'] ||
        '') as string;
      if (!host || !pins.some((p) => host.includes(p))) {
        throw new BadRequestException('Untrusted forwarder');
      }
    }
    return true;
  }
}
