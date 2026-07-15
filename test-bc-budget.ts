import 'dotenv/config';
import { getBudgets, createBudget, updateBudget, deleteBudget } from './services/business-central/budget.service';
import { getCategories } from './services/business-central/category.service';
import { BCBudgetCreateDTO, BCBudgetUpdateDTO } from './types/budget.types';

const OWNER_OID = '134106d4-b9a8-4565-8375-2b51a04d638d';

async function testBudgets() {
  console.log('--- STARTING BUDGETS API TEST ---');

  try {
    // 1. Get Categories to link to
    console.log('\n1. Fetching/Creating Categories...');
    let categories = await getCategories(OWNER_OID, { top: 10 });
    
    // Create dummy categories if we have less than 3
    const categoriesNeeded = 3 - categories.value.length;
    if (categoriesNeeded > 0) {
      console.log(`Need ${categoriesNeeded} more categories. Creating them...`);
      const { createCategory } = await import('./services/business-central/category.service');
      for (let i = 0; i < categoriesNeeded; i++) {
        await createCategory({
          ownerEntraObjectId: OWNER_OID,
          code: `DUMMY-${i+1}`,
          name: `Dummy Category ${i+1}`,
          transactionType: 'Expense',
          displayOrder: 10 + i,
          isActive: true,
          colorCode: '#FF0000',
          iconName: 'ShoppingCart'
        });
      }
      // Re-fetch categories
      categories = await getCategories(OWNER_OID, { top: 10 });
    }

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // 2. Create 3 Budgets
    console.log('\n2. Creating 3 Dummy Budgets (Without Deleting)...');
    
    for (let i = 0; i < Math.min(3, categories.value.length); i++) {
      const category = categories.value[i];
      const createDto: BCBudgetCreateDTO = {
        ownerEntraObjectId: OWNER_OID,
        categoryId: category.systemId,
        budgetMonth: currentMonth,
        budgetYear: currentYear,
        budgetAmount: 5000 + (i * 2000), // 5000, 7000, 9000
        notes: `Dummy Budget ${i+1} for ${category.name}`
      };

      // Check if exists first to avoid duplicates
      const existing = await getBudgets(OWNER_OID, { budgetMonth: currentMonth, budgetYear: currentYear, categoryId: category.systemId });
      if (existing.value && existing.value.length > 0) {
        console.log(`Budget already exists for ${category.name}, skipping creation.`);
      } else {
        const newBudget = await createBudget(createDto);
        console.log(`✅ Success! Created Budget for ${category.name}: ${newBudget.systemId} with amount ${newBudget.budgetAmount}`);
      }
    }

    console.log('\n--- DUMMY BUDGETS CREATION COMPLETE ---');
  } catch (error: any) {
    console.error('\n❌ Error during test:');
    console.error(error);
  }
}

testBudgets();
