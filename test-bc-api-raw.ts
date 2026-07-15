import 'dotenv/config'; // Load .env.local
import { bcFetch } from './services/business-central/client';
import { env } from './config/env';

const OWNER_OID = '134106d4-b9a8-4565-8375-2b51a04d638d';

async function testAll() {
  console.log('--- STARTING RAW API TESTS ---');
  
  const endpointsToTest = [
    `/api/alletec/moneyTracker/v1.0/companies(${env.BC_COMPANY_ID})/accounts`,
    `/api/alletec/moneyTracker/v1.0/companies(${env.BC_COMPANY_ID})/accounts?$top=10`,
    `/api/alletec/moneyTracker/v1.0/companies(${env.BC_COMPANY_ID})/transactions`,
    `/api/alletec/moneyTracker/v1.0/companies(${env.BC_COMPANY_ID})/transactions?$top=10`
  ];

  for (const ep of endpointsToTest) {
    console.log(`\nTesting: ${ep}`);
    try {
      const data = await bcFetch(ep);
      console.log(`✅ Success! Fetched ${data.value?.length || 0} items.`);
    } catch (err: any) {
      console.error(`❌ Failed: ${err.message || err}`);
    }
  }
}

testAll();
