// src/features/chw/chw.service.ts
import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { Strategy } from './strategies/base.strategy';
import { CHW_STRATEGIES } from './strategies/strategy.tokens';

@Injectable()
export class ChwService {
  constructor(
    @Inject(CHW_STRATEGIES) private readonly strategies: Strategy[],
  ) {}

  resolve(messageType: string): Strategy {
    const strat = this.strategies.find((s) => s.code === messageType);
    if (!strat)
      throw new BadRequestException(`Unsupported messageType: ${messageType}`);
    return strat;
  }

  run(messageType: string, dto: any, ctx: any) {
    return this.resolve(messageType).handle(dto, ctx);
  }
}
