import { calculateEMI } from './services/financial-math/emi';
import { generateAmortizationSchedule } from './services/financial-math/amortization';
import { calculateTotalInterest } from './services/financial-math/loan-math';

console.log("=== EMI & AMORTIZATION TESTING ===\n");

// 1. Home Loan
// Principal: 50,00,000, Rate: 8.75%, Tenure: 240 months
const homePrincipal = 5000000;
const homeRate = 8.75;
const homeTenure = 240;
const homeEmi = calculateEMI(homePrincipal, homeRate, homeTenure);
const homeSchedule = generateAmortizationSchedule(homePrincipal, homeRate, homeEmi, '2024-01-01', homeTenure);
const homeTotalInt = calculateTotalInterest(homeEmi, homeTenure, homePrincipal);

console.log("1. HDFC Home Loan (50L, 8.75%, 20 yrs)");
console.log(`Expected EMI: ~44,186`); // Wait, my previous plan said 44,086. Let's see what it actually is.
console.log(`Calculated EMI: ₹${homeEmi.toLocaleString('en-IN')}`);
console.log(`Total Interest: ₹${homeTotalInt.toLocaleString('en-IN')}`);
console.log(`Schedule Length: ${homeSchedule.length} months`);
console.log(`Last Row Outstanding: ₹${homeSchedule[homeSchedule.length - 1].outstanding}`);
console.log("---");

// 2. Personal Loan
// Principal: 3,00,000, Rate: 14.50%, Tenure: 36 months
const plPrincipal = 300000;
const plRate = 14.50;
const plTenure = 36;
const plEmi = calculateEMI(plPrincipal, plRate, plTenure);
const plSchedule = generateAmortizationSchedule(plPrincipal, plRate, plEmi, '2024-01-01', plTenure);
const plTotalInt = calculateTotalInterest(plEmi, plTenure, plPrincipal);

console.log("2. ICICI Personal Loan (3L, 14.5%, 3 yrs)");
console.log(`Calculated EMI: ₹${plEmi.toLocaleString('en-IN')}`);
console.log(`Total Interest: ₹${plTotalInt.toLocaleString('en-IN')}`);
console.log(`Last Row Outstanding: ₹${plSchedule[plSchedule.length - 1].outstanding}`);
console.log("---");

// 3. Car Loan
// Principal: 8,00,000, Rate: 9.20%, Tenure: 60 months
const carPrincipal = 800000;
const carRate = 9.20;
const carTenure = 60;
const carEmi = calculateEMI(carPrincipal, carRate, carTenure);
const carSchedule = generateAmortizationSchedule(carPrincipal, carRate, carEmi, '2024-01-01', carTenure);
const carTotalInt = calculateTotalInterest(carEmi, carTenure, carPrincipal);

console.log("3. SBI Car Loan (8L, 9.2%, 5 yrs)");
console.log(`Calculated EMI: ₹${carEmi.toLocaleString('en-IN')}`);
console.log(`Total Interest: ₹${carTotalInt.toLocaleString('en-IN')}`);
console.log(`Last Row Outstanding: ₹${carSchedule[carSchedule.length - 1].outstanding}`);
console.log("==================================\n");
