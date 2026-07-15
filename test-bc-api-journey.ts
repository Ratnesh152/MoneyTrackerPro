import 'dotenv/config'; // Load .env.local
import { createAccount, getAccounts } from './services/business-central/account.service';
import { createCategory, getCategories, BCCategoryCreateDTO } from './services/business-central/category.service';
import { transactionService } from './services/business-central/transaction.service';
import { getDashboardData } from './services/dashboard.service';
import { BCAccountCreateDTO } from './types/account.types';
import { BCTransactionCreateDTO } from './types/transaction.types';

const OWNER_OID = '134106d4-b9a8-4565-8375-2b51a04d638d';

async function simulateUserJourney() {
  console.log('--- STARTING USER JOURNEY SIMULATION ---');

  try {
    console.log('\n1. Creating Account...');
    const accountDto: BCAccountCreateDTO = {
      ownerEntraObjectId: OWNER_OID,
      name: 'Test Wallet',
      accountType: 'Cash',
      openingBalance: 1000,
      isDefault: false,
      notes: 'Created by Script'
    };
    const newAccount = await createAccount(accountDto);
    console.log(`✅ Success! Created Account: ${newAccount.name} (${newAccount.systemId})`);

    console.log('\n2. Creating Category...');
    const categoryDto: BCCategoryCreateDTO = {
      ownerEntraObjectId: OWNER_OID,
      code: 'TEST-SAL',
      name: 'Test Salary',
      transactionType: 'Income',
      displayOrder: 1,
      isActive: true,
      colorCode: '#00FF00',
      iconName: 'DollarSign'
    };
    const newCategory = await createCategory(categoryDto);
    console.log(`✅ Success! Created Category: ${newCategory.name} (${newCategory.systemId})`);

    console.log('\n3. Creating Transaction...');
    const transactionDto: Omit<BCTransactionCreateDTO, 'ownerEntraObjectId'> = {
      transactionDate: new Date().toISOString().split('T')[0],
      transactionType: 'Income',
      description: 'Script generated income',
      categoryId: newCategory.systemId,
      categoryCode: newCategory.code,
      accountId: newAccount.systemId,
      accountCode: 'CASH', // Mock or generate
      amount: 500,
      currencyCode: 'INR',
      paymentMethodCode: 'CASH',
      reference: 'REF-001',
      notes: 'Test note',
      tags: 'test'
    };

    // Note: the createTransaction function takes ownerOid as first param, then DTO
    const newTx = await transactionService.createTransaction(OWNER_OID, transactionDto);
    console.log(`✅ Success! Created Transaction: ${newTx.description} (${newTx.systemId})`);

    console.log('\n4. Fetching Dashboard Data...');
    const dashboard = await getDashboardData(OWNER_OID);
    console.log(`✅ Success! Dashboard Net Worth: ${dashboard.summary.netWorth}`);

  } catch (err: any) {
    console.error('\n❌ FAILED:', err.message || err);
  }

  console.log('\n--- SIMULATION COMPLETED ---');
}

simulateUserJourney();
