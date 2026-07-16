import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { 
  getLoans, 
  createLoan, 
  updateLoan, 
  deleteLoan 
} from './services/business-central/loan.service';
import { BCLoanCreateDTO, BCLoanUpdateDTO } from './types/loan.types';

const OWNER_OID = 'test-user-123';

async function runTests() {
  console.log('--- STARTING LOANS API TEST ---');

  try {
    // 1. Create Dummy Loan 1
    console.log('\n1. Creating Dummy Home Loan...');
    const loan1Dto: BCLoanCreateDTO = {
      ownerEntraObjectId: OWNER_OID,
      loanName: 'SBI MaxGain Home Loan',
      lenderName: 'State Bank of India',
      loanType: 'Home',
      principalAmount: 5000000,
      interestRate: 8.5,
      tenureMonths: 240,
      emiAmount: 43391.20,
      startDate: '2023-01-15',
      loanAccountNumber: 'HL-12345',
      currencyCode: 'INR',
      supportsPrepayment: true,
      status: 'Active',
      notes: 'Primary residence loan',
    };
    
    // Cleanup if exists
    const existingLoans = await getLoans(OWNER_OID);
    const existing1 = existingLoans.value.find((l: any) => l.loanAccountNumber === 'HL-12345');
    if (existing1) {
      await deleteLoan(existing1.systemId, OWNER_OID, existing1.etag);
    }
    const newLoan1 = await createLoan(loan1Dto);
    console.log(`✅ Success! Created: ${newLoan1.loanName}`);

    // 2. Create Dummy Loan 2
    console.log('\n2. Creating Dummy Personal Loan...');
    const loan2Dto: BCLoanCreateDTO = {
      ownerEntraObjectId: OWNER_OID,
      loanName: 'HDFC Personal Loan',
      lenderName: 'HDFC Bank',
      loanType: 'Personal',
      principalAmount: 500000,
      interestRate: 11.5,
      tenureMonths: 60,
      emiAmount: 10996,
      startDate: '2024-05-10',
      loanAccountNumber: 'PL-98765',
      currencyCode: 'INR',
      supportsPrepayment: false,
      status: 'Active',
    };
    
    const loans = (await getLoans(OWNER_OID)).value;
    const existing2 = loans.find((l: any) => l.loanName === 'SBI Car Loan');
    if (existing2) {
      console.log(`Deleting existing SBI Car Loan (${existing2.systemId})...`);
      await deleteLoan(existing2.systemId, OWNER_OID, existing2.etag!);
    }
    const newLoan2 = await createLoan(loan2Dto);
    console.log(`✅ Success! Created: ${newLoan2.loanName}`);

    // 3. (Removed AL date validation test as endDate is not stored)
    console.log('\n3. Skipping AL Date Validation Test (End Date removed)...');

    // 4. Test Duplicate Validation (Same Account Number)
    console.log('\n4. Testing Duplicate Validation...');
    try {
      await createLoan(loan1Dto);
      console.error('❌ Failed! Allowed creating duplicate loan account number.');
    } catch (e: any) {
      console.log('✅ Success! Validation caught error:', e.message);
    }

    // 5. Update Loan 2 (Change Status to Closed)
    console.log('\n5. Updating Loan Status to Closed...');
    const updateDto: BCLoanUpdateDTO = {
      status: 'Closed',
      notes: 'Pre-closed early!',
    };
    
    const fetchedLoan2 = (await getLoans(OWNER_OID)).value.find((l: any) => l.systemId === newLoan2.systemId);
    const updatedLoan2 = await updateLoan(newLoan2.systemId, OWNER_OID, updateDto, fetchedLoan2!.etag);
    console.log(`✅ Success! Updated ${updatedLoan2.loanName} status to: ${updatedLoan2.status}`);

    console.log('\n--- LOANS API TEST COMPLETE ---');
  } catch (error: any) {
    console.error('\n❌ Error during test:');
    console.error(error);
  }
}

runTests();
