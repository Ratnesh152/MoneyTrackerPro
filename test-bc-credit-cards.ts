import 'dotenv/config';
import { 
  createCreditCard, 
  getCreditCards, 
  updateCreditCard, 
  deleteCreditCard 
} from './services/business-central/credit-card.service';
import { BCreditCardCreateDTO, BCreditCardUpdateDTO } from './types/credit-card.types';

const OWNER_OID = '134106d4-b9a8-4565-8375-2b51a04d638d';

async function runTests() {
  console.log('--- STARTING CREDIT CARDS API TEST ---');

  try {
    // 1. Create Dummy Credit Card 1
    console.log('\n1. Creating Dummy Card 1...');
    const card1Dto: BCreditCardCreateDTO = {
      ownerEntraObjectId: OWNER_OID,
      cardName: 'HDFC Regalia Gold',
      issuingBank: 'HDFC Bank',
      cardNetwork: 'Visa',
      last4Digits: '4455',
      creditLimit: 250000,
      currencyCode: 'INR',
      statementDay: 15,
      dueDay: 5,
      interestRate: 42.0,
      annualFee: 2500,
      supportsEMI: true,
      isActive: true,
      notes: 'Primary travel and lifestyle card.',
    };
    
    // Cleanup if exists
    let existingCards = await getCreditCards(OWNER_OID);
    let existing1 = existingCards.value.find((c: any) => c.issuingBank === 'HDFC Bank' && c.last4Digits === '4455');
    if (existing1) {
      await deleteCreditCard(existing1.systemId, OWNER_OID, existing1.etag);
    }
    const newCard1 = await createCreditCard(card1Dto);
    console.log(`✅ Success! Created: ${newCard1.cardName}`);

    // 2. Create Dummy Credit Card 2
    console.log('\n2. Creating Dummy Card 2...');
    const card2Dto: BCreditCardCreateDTO = {
      ownerEntraObjectId: OWNER_OID,
      cardName: 'Amazon Pay ICICI',
      issuingBank: 'ICICI Bank',
      cardNetwork: 'Visa',
      last4Digits: '9012',
      creditLimit: 150000,
      currencyCode: 'INR',
      statementDay: 20,
      dueDay: 8,
      interestRate: 40.0,
      annualFee: 0,
      supportsEMI: false,
      isActive: true,
      notes: 'For Amazon shopping cashbacks.',
    };
    
    existingCards = await getCreditCards(OWNER_OID);
    let existing2 = existingCards.value.find((c: any) => c.issuingBank === 'ICICI Bank' && c.last4Digits === '9012');
    if (existing2) {
      await deleteCreditCard(existing2.systemId, OWNER_OID, existing2.etag);
    }
    const newCard2 = await createCreditCard(card2Dto);
    console.log(`✅ Success! Created: ${newCard2.cardName}`);

    // 3. Create Dummy Credit Card 3
    console.log('\n3. Creating Dummy Card 3...');
    const card3Dto: BCreditCardCreateDTO = {
      ownerEntraObjectId: OWNER_OID,
      cardName: 'Amex Platinum Travel',
      issuingBank: 'American Express',
      cardNetwork: 'Amex',
      last4Digits: '1005',
      creditLimit: 400000,
      currencyCode: 'INR',
      statementDay: 1,
      dueDay: 18,
      interestRate: 36.0,
      annualFee: 3500,
      supportsEMI: false,
      isActive: true,
      notes: 'Milestone benefits.',
    };
    
    existingCards = await getCreditCards(OWNER_OID);
    let existing3 = existingCards.value.find((c: any) => c.issuingBank === 'American Express' && c.last4Digits === '1005');
    if (existing3) {
      await deleteCreditCard(existing3.systemId, OWNER_OID, existing3.etag);
    }
    const newCard3 = await createCreditCard(card3Dto);
    console.log(`✅ Success! Created: ${newCard3.cardName}`);

    console.log('\n--- DUMMY DATA CREATION COMPLETE ---');
  } catch (error: any) {
    console.error('\n❌ Error during test:');
    console.error(error);
  }
}

runTests();
