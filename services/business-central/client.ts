import { env } from '@/config/env';

let cachedToken: string | null = null;
let tokenExpiryTime: number | null = null;

async function getClientCredentialsToken(): Promise<string> {
  // If we have a valid token (with 1 minute buffer), return it
  if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime - 60000) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    client_id: env.ENTRA_CLIENT_ID,
    client_secret: env.ENTRA_CLIENT_SECRET,
    scope: 'https://api.businesscentral.dynamics.com/.default',
    grant_type: 'client_credentials'
  });

  const res = await fetch(`https://login.microsoftonline.com/${env.ENTRA_TENANT_ID}/oauth2/v2.0/token`, {
    method: 'POST',
    body: params,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch client credentials token: ${res.statusText}`);
  }

  const data = await res.json();
  cachedToken = data.access_token as string;
  tokenExpiryTime = Date.now() + (data.expires_in * 1000);
  
  return cachedToken;
}

/**
 * Base Business Central API Client
 */
export async function bcFetch(endpoint: string, options?: RequestInit) {
  const baseUrl = env.BC_API_URL; // e.g. https://api.businesscentral.dynamics.com/v2.0/{tenant}
  
  const token = await getClientCredentialsToken();
  
  const headers = new Headers(options?.headers);
  if (!headers.has('Content-Type') && options?.method && options.method !== 'GET') {
    headers.set('Content-Type', 'application/json');
  }
  headers.set('Authorization', `Bearer ${token}`);
  
  // BC APIs require the environment name before the /api/ path
  const url = endpoint.startsWith('http') 
    ? endpoint 
    : `${baseUrl}/${env.BC_ENVIRONMENT}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let bcErrorDetail = '';
    try {
      const errBody = await response.json();
      bcErrorDetail = JSON.stringify(errBody);
    } catch {
      bcErrorDetail = response.statusText;
    }
    
    let errorName = 'Error';
    if (response.status === 412) {
      errorName = 'ConcurrencyConflictError';
    } else if (response.status === 404) {
      errorName = 'NotFoundError';
    }

    const error = new Error(errorName === 'Error' ? `BC API Error: ${bcErrorDetail} [URL: ${url}]` : errorName) as Error & { statusCode?: number };
    error.name = errorName;
    error.statusCode = response.status;
    throw error;
  }

  // Support 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
