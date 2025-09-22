export interface StrategyContext {
  dhisUser: string;
  requestId: string;
  timestamp: string;
}

export interface Strategy {
  code: string; // one of MESSAGE_TYPES
  // eslint-disable-next-line prettier/prettier
  handle(dto: any, ctx: StrategyContext): Promise<{ status: number; payload: any }>;
}
