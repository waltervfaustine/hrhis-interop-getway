/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios';

export type ExternalAuthMode =
  | 'basic'
  | 'bearer'
  | 'api-headers'
  | 'api-query-params'
  | 'oauth2-client-credentials'
  | 'none'
  | undefined;

export interface ExternalAuthResult {
  headers: Record<string, string>;
  query: Record<string, string>;
}

const OAUTH2_SKEW_SEC = 30;

// In-memory token cache (per-process)
let cachedToken: {
  accessToken: string;
  expiresAt: number; // epoch seconds
} | null = null;

function b64(s: string) {
  return Buffer.from(s, 'utf8').toString('base64');
}

function nowSec() {
  return Math.floor(Date.now() / 1000);
}

async function fetchOAuth2Token(): Promise<{
  access_token: string;
  expires_in?: number;
}> {
  const clientId = process.env.EXTERNAL_OAUTH2_CLIENT_ID || '';
  const clientSecret = process.env.EXTERNAL_OAUTH2_CLIENT_SECRET || '';
  const tokenUri = process.env.EXTERNAL_OAUTH2_TOKEN_URI || '';

  if (!clientId || !clientSecret || !tokenUri) {
    throw new Error(
      'oauth2-client-credentials requires EXTERNAL_OAUTH2_CLIENT_ID, _SECRET, and _TOKEN_URI',
    );
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
  });

  // RFC 6749 basic auth for token endpoint
  const authHeader = `Basic ${b64(`${clientId}:${clientSecret}`)}`;

  const resp = await axios.post(tokenUri, body.toString(), {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: authHeader,
    },
    // Let us inspect non-2xx errors as proper throws
    validateStatus: (s) => s >= 200 && s < 300,
    timeout: Number(process.env.HTTP_TIMEOUT_MS || 8000),
  });

  // Expected: { access_token, token_type, expires_in }
  return resp.data as { access_token: string; expires_in?: number };
}

async function getOAuth2Token(): Promise<string> {
  // Serve from cache if still valid (with skew)
  if (cachedToken && cachedToken.expiresAt - OAUTH2_SKEW_SEC > nowSec()) {
    return cachedToken.accessToken;
  }

  const data = await fetchOAuth2Token();
  const access = data.access_token;
  if (!access) throw new Error('Token endpoint did not return access_token');

  const ttl = typeof data.expires_in === 'number' ? data.expires_in : 3600;
  cachedToken = {
    accessToken: access,
    expiresAt: nowSec() + ttl,
  };
  return access;
}

/**
 * Build auth for outbound external API calls based on env config.
 * It returns headers/query you should merge into your request.
 *
 * Supported modes:
 *  - none
 *  - basic (EXTERNAL_BASIC_USERNAME, EXTERNAL_BASIC_PASSWORD)
 *  - bearer (EXTERNAL_BEARER_TOKEN)
 *  - api-headers (EXTERNAL_API_HEADERS as JSON object)
 *  - api-query-params (EXTERNAL_API_QUERY as JSON object)
 *  - oauth2-client-credentials (EXTERNAL_OAUTH2_CLIENT_ID/_SECRET/_TOKEN_URI)
 */
export async function buildExternalAuth(
  _path?: string,
): Promise<ExternalAuthResult> {
  const mode = (
    process.env.EXTERNAL_AUTH_MODE || 'none'
  ).toLowerCase() as ExternalAuthMode;

  switch (mode) {
    case 'none':
      return { headers: {}, query: {} };

    case 'basic': {
      const user = process.env.EXTERNAL_BASIC_USERNAME || '';
      const pass = process.env.EXTERNAL_BASIC_PASSWORD || '';
      if (!user || !pass) {
        throw new Error(
          'EXTERNAL_AUTH_MODE=basic requires EXTERNAL_BASIC_USERNAME and EXTERNAL_BASIC_PASSWORD',
        );
      }
      return {
        headers: { Authorization: `Basic ${b64(`${user}:${pass}`)}` },
        query: {},
      };
    }

    case 'bearer': {
      const token = process.env.EXTERNAL_BEARER_TOKEN || '';
      if (!token)
        throw new Error(
          'EXTERNAL_AUTH_MODE=bearer requires EXTERNAL_BEARER_TOKEN',
        );
      return { headers: { Authorization: `Bearer ${token}` }, query: {} };
    }

    case 'api-headers': {
      const raw = process.env.EXTERNAL_API_HEADERS || '{}';
      let obj: Record<string, string> = {};
      try {
        obj = JSON.parse(raw);
      } catch {
        throw new Error(
          'EXTERNAL_API_HEADERS must be valid JSON (e.g. {"X-API-Key":"abc"})',
        );
      }
      // Normalize header values to strings
      const headers: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj)) headers[k] = String(v);
      return { headers, query: {} };
    }

    case 'api-query-params': {
      const raw = process.env.EXTERNAL_API_QUERY || '{}';
      let obj: Record<string, string> = {};
      try {
        obj = JSON.parse(raw);
      } catch {
        throw new Error(
          'EXTERNAL_API_QUERY must be valid JSON (e.g. {"token":"abc"})',
        );
      }
      const query: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj)) query[k] = String(v);
      return { headers: {}, query };
    }

    case 'oauth2-client-credentials': {
      const token = await getOAuth2Token();
      return { headers: { Authorization: `Bearer ${token}` }, query: {} };
    }

    default:
      throw new Error(`Unknown EXTERNAL_AUTH_MODE: ${mode}`);
  }
}
