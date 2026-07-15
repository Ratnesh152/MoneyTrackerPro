import 'dotenv/config'; // Load .env.local
import { getAccounts } from './services/business-central/account.service';
import { getCategories } from './services/business-central/category.service';
import { transactionService } from './services/business-central/transaction.service';
import { getDashboardData } from './services/dashboard.service';

const OWNER_OID = '134106d4-b9a8-4565-8375-2b51a04d638d';

async function testAll() {
  console.log('--- STARTING BC API TESTS ---');

  try {
    console.log('\n1. Testing getAccounts()...');
    const accounts = await getAccounts(OWNER_OID);
    console.log(`✅ Success! Found ${accounts.value.length} accounts.`);
  } catch (err: any) {
    console.error('❌ Failed getAccounts():', err.message || err);
  }

  try {
    console.log('\n2. Testing getCategories()...');
    const categories = await getCategories(OWNER_OID);
    console.log(`✅ Success! Found ${categories.value.length} categories.`);
  } catch (err: any) {
    console.error('❌ Failed getCategories():', err.message || err);
  }

  try {
    console.log('\n3. Testing getTransactions()...');
    const transactions = await transactionService.getTransactions(OWNER_OID);
    console.log(`✅ Success! Found ${transactions.value.length} transactions.`);
  } catch (err: any) {
    console.error('❌ Failed getTransactions():', err.message || err);
  }

  try {
    console.log('\n4. Testing getDashboardData()...');
    const dashboard = await getDashboardData(OWNER_OID);
    console.log(`✅ Success! Dashboard generated with Net Worth: ${dashboard.summary.netWorth}`);
  } catch (err: any) {
    console.error('❌ Failed getDashboardData():', err.message || err);
  }

  console.log('\n--- TESTS COMPLETED ---');
}

testAll();
