import * as XLSX from 'xlsx';
import { EXPENSE_CATEGORIES } from './constants';

export const exportMonthlyDataToExcel = (expenses, selectedMonth) => {
  // Filter expenses for the selected month
  const monthlyExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date || expense.createdAt);
    const expenseMonth = expenseDate.toISOString().slice(0, 7);
    return expenseMonth === selectedMonth;
  });

  // Separate data by type
  const incomeData = monthlyExpenses.filter(exp => exp.type === 'income');
  const expenseData = monthlyExpenses.filter(exp => exp.type === 'expense');
  const recurringData = monthlyExpenses.filter(exp => exp.isRecurring);
  const regularData = monthlyExpenses.filter(exp => !exp.isRecurring);

  // Create workbook
  const wb = XLSX.utils.book_new();

  // 1. Summary Sheet
  const summaryData = createSummarySheet(monthlyExpenses, selectedMonth);
  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, summaryWs, "Summary");

  // 2. Income Sheet
  const incomeSheetData = createIncomeSheet(incomeData);
  const incomeWs = XLSX.utils.aoa_to_sheet(incomeSheetData);
  XLSX.utils.book_append_sheet(wb, incomeWs, "Income");

  // 3. Recurring Expenses Sheet
  const recurringSheetData = createRecurringSheet(recurringData.filter(exp => exp.type === 'expense'));
  const recurringWs = XLSX.utils.aoa_to_sheet(recurringSheetData);
  XLSX.utils.book_append_sheet(wb, recurringWs, "Recurring Expenses");

  // 4. One-time Expenses Sheet
  const regularSheetData = createRegularExpensesSheet(regularData.filter(exp => exp.type === 'expense'));
  const regularWs = XLSX.utils.aoa_to_sheet(regularSheetData);
  XLSX.utils.book_append_sheet(wb, regularWs, "One-time Expenses");

  // 5. Category Breakdown Sheets
  Object.entries(EXPENSE_CATEGORIES).forEach(([categoryKey, categoryInfo]) => {
    const categoryExpenses = expenseData.filter(exp => 
      exp.detailedCategory === categoryKey || exp.category === categoryKey
    );
    
    if (categoryExpenses.length > 0) {
      const categorySheetData = createCategorySheet(categoryExpenses, categoryInfo);
      const categoryWs = XLSX.utils.aoa_to_sheet(categorySheetData);
      XLSX.utils.book_append_sheet(wb, categoryWs, categoryInfo.label.slice(0, 31)); // Excel sheet name limit
    }
  });

  // 6. All Transactions Sheet
  const allTransactionsData = createAllTransactionsSheet(monthlyExpenses);
  const allTransactionsWs = XLSX.utils.aoa_to_sheet(allTransactionsData);
  XLSX.utils.book_append_sheet(wb, allTransactionsWs, "All Transactions");

  // Save file
  const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });
  const fileName = `Expense_Report_${monthName.replace(' ', '_')}.xlsx`;
  
  XLSX.writeFile(wb, fileName);
};

const createSummarySheet = (monthlyExpenses, selectedMonth) => {
  const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  const totalIncome = monthlyExpenses
    .filter(exp => exp.type === 'income')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const totalExpenses = monthlyExpenses
    .filter(exp => exp.type === 'expense')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const recurringExpenses = monthlyExpenses
    .filter(exp => exp.isRecurring && exp.type === 'expense')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const regularExpenses = monthlyExpenses
    .filter(exp => !exp.isRecurring && exp.type === 'expense')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const netBalance = totalIncome - totalExpenses;

  // Budget category breakdown
  const needsTotal = monthlyExpenses
    .filter(exp => exp.category === 'NEEDS' && exp.type === 'expense')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const wantsTotal = monthlyExpenses
    .filter(exp => exp.category === 'WANTS' && exp.type === 'expense')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const savingsTotal = monthlyExpenses
    .filter(exp => exp.category === 'SAVINGS' && exp.type === 'expense')
    .reduce((sum, exp) => sum + exp.amount, 0);

  return [
    [`Monthly Financial Summary - ${monthName}`],
    [''],
    ['INCOME & EXPENSES'],
    ['Total Income', `Rs. ${totalIncome.toLocaleString()}`],
    ['Total Expenses', `Rs. ${totalExpenses.toLocaleString()}`],
    ['Net Balance', `Rs. ${netBalance.toLocaleString()}`],
    [''],
    ['EXPENSE BREAKDOWN'],
    ['Recurring Expenses', `Rs. ${recurringExpenses.toLocaleString()}`],
    ['One-time Expenses', `Rs. ${regularExpenses.toLocaleString()}`],
    [''],
    ['50/30/20 BUDGET ANALYSIS'],
    ['Needs (50%)', `Rs. ${needsTotal.toLocaleString()}`, `${totalIncome > 0 ? ((needsTotal / totalIncome) * 100).toFixed(1) : 0}%`],
    ['Wants (30%)', `Rs. ${wantsTotal.toLocaleString()}`, `${totalIncome > 0 ? ((wantsTotal / totalIncome) * 100).toFixed(1) : 0}%`],
    ['Savings (20%)', `Rs. ${savingsTotal.toLocaleString()}`, `${totalIncome > 0 ? ((savingsTotal / totalIncome) * 100).toFixed(1) : 0}%`],
    [''],
    ['TRANSACTION COUNTS'],
    ['Total Transactions', monthlyExpenses.length],
    ['Income Transactions', monthlyExpenses.filter(exp => exp.type === 'income').length],
    ['Expense Transactions', monthlyExpenses.filter(exp => exp.type === 'expense').length],
    ['Recurring Transactions', monthlyExpenses.filter(exp => exp.isRecurring).length]
  ];
};

const createIncomeSheet = (incomeData) => {
  const headers = ['Date', 'Description', 'Amount', 'Category', 'Subcategory', 'Source'];
  const rows = incomeData.map(income => [
    new Date(income.date || income.createdAt).toLocaleDateString(),
    income.description,
    income.amount,
    EXPENSE_CATEGORIES[income.detailedCategory]?.label || 'Income',
    income.subcategory || '',
    income.isRecurring ? 'Recurring' : 'One-time'
  ]);

  const total = incomeData.reduce((sum, income) => sum + income.amount, 0);
  
  return [
    ['INCOME SUMMARY'],
    [''],
    headers,
    ...rows,
    [''],
    ['TOTAL INCOME', '', total, '', '', '']
  ];
};

const createRecurringSheet = (recurringData) => {
  const headers = ['Date', 'Description', 'Amount', 'Category', 'Subcategory', 'Due Date', 'Status'];
  const rows = recurringData.map(expense => [
    new Date(expense.date || expense.createdAt).toLocaleDateString(),
    expense.description,
    expense.amount,
    EXPENSE_CATEGORIES[expense.detailedCategory]?.label || expense.category,
    expense.subcategory || '',
    `${expense.dueDate || 'N/A'}th of month`,
    'Paid' // Since it's in expenses, it was marked as paid
  ]);

  const total = recurringData.reduce((sum, expense) => sum + expense.amount, 0);
  
  return [
    ['RECURRING EXPENSES'],
    [''],
    headers,
    ...rows,
    [''],
    ['TOTAL RECURRING', '', total, '', '', '', '']
  ];
};

const createRegularExpensesSheet = (regularData) => {
  const headers = ['Date', 'Description', 'Amount', 'Category', 'Subcategory', 'Budget Category'];
  const rows = regularData.map(expense => [
    new Date(expense.date || expense.createdAt).toLocaleDateString(),
    expense.description,
    expense.amount,
    EXPENSE_CATEGORIES[expense.detailedCategory]?.label || expense.category,
    expense.subcategory || '',
    expense.category // NEEDS/WANTS/SAVINGS
  ]);

  const total = regularData.reduce((sum, expense) => sum + expense.amount, 0);
  
  return [
    ['ONE-TIME EXPENSES'],
    [''],
    headers,
    ...rows,
    [''],
    ['TOTAL ONE-TIME', '', total, '', '', '']
  ];
};

const createCategorySheet = (categoryExpenses, categoryInfo) => {
  const headers = ['Date', 'Description', 'Amount', 'Subcategory', 'Type', 'Budget Category'];
  
  // Group by subcategory
  const subcategoryGroups = {};
  categoryExpenses.forEach(expense => {
    const subcat = expense.subcategory || 'Other';
    if (!subcategoryGroups[subcat]) {
      subcategoryGroups[subcat] = [];
    }
    subcategoryGroups[subcat].push(expense);
  });

  const rows = [];
  Object.entries(subcategoryGroups).forEach(([subcategory, expenses]) => {
    rows.push([`--- ${subcategory.toUpperCase()} ---`, '', '', '', '', '']);
    expenses.forEach(expense => {
      rows.push([
        new Date(expense.date || expense.createdAt).toLocaleDateString(),
        expense.description,
        expense.amount,
        expense.subcategory || '',
        expense.isRecurring ? 'Recurring' : 'One-time',
        expense.category
      ]);
    });
    const subcategoryTotal = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    rows.push(['', `${subcategory} Total`, subcategoryTotal, '', '', '']);
    rows.push(['']);
  });

  const total = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  return [
    [`${categoryInfo.label.toUpperCase()} BREAKDOWN`],
    [''],
    headers,
    ...rows,
    ['CATEGORY TOTAL', '', total, '', '', '']
  ];
};

const createAllTransactionsSheet = (monthlyExpenses) => {
  const headers = ['Date', 'Description', 'Amount', 'Type', 'Category', 'Subcategory', 'Budget Category', 'Source'];
  const rows = monthlyExpenses
    .sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt))
    .map(expense => [
      new Date(expense.date || expense.createdAt).toLocaleDateString(),
      expense.description,
      expense.type === 'income' ? expense.amount : -expense.amount, // Negative for expenses
      expense.type,
      EXPENSE_CATEGORIES[expense.detailedCategory]?.label || expense.category,
      expense.subcategory || '',
      expense.category,
      expense.isRecurring ? 'Recurring' : 'One-time'
    ]);

  const totalIncome = monthlyExpenses
    .filter(exp => exp.type === 'income')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const totalExpenses = monthlyExpenses
    .filter(exp => exp.type === 'expense')
    .reduce((sum, exp) => sum + exp.amount, 0);

  return [
    ['ALL TRANSACTIONS (Income positive, Expenses negative)'],
    [''],
    headers,
    ...rows,
    [''],
    ['SUMMARY'],
    ['Total Income', '', totalIncome, '', '', '', '', ''],
    ['Total Expenses', '', -totalExpenses, '', '', '', '', ''],
    ['Net Balance', '', totalIncome - totalExpenses, '', '', '', '', '']
  ];
};