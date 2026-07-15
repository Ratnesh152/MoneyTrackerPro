import 'dotenv/config';
import { getAccounts } from './services/business-central/account.service';

const OWNER_OID = '134106d4-b9a8-4565-8375-2b51a04d638d';

async function testAccounts() {
  console.log('--- STARTING ACCOUNTS API TEST ---');

  try {
    const accounts = await getAccounts(OWNER_OID, { skip: 0, top: 50 });
    console.log(`✅ Success! Fetched ${accounts.value.length} accounts.`);
  } catch (error: any) {
    console.error('\n❌ Error during test:');
    console.error(error);
  }
}

testAccounts();
