import { describe, it, expect } from 'vitest';
import { bcFetch } from '../../services/business-central/client';
import { env } from '../../config/env';

describe('Accounts API Contract', () => {
  it('fetches accounts and logs the contract', async () => {
    // The base URL in bcFetch already includes /v2.0/tenant/environment
    // So we just need the API route: /api/alletec/moneyTracker/v1.0/companies({env.BC_COMPANY_ID})/accounts
    const endpoint = `/api/alletec/moneyTracker/v1.0/companies(${env.BC_COMPANY_ID})/accounts`;
    
    console.log(`Fetching from endpoint: ${endpoint}`);
    const response = await bcFetch(endpoint);
    
    console.log('--- API CONTRACT ---');
    console.log(JSON.stringify(response, null, 2));
    console.log('--------------------');
    
    expect(response).toBeDefined();
  });
});
