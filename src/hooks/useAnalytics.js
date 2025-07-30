import { useMemo } from 'react';
import { useExpenses } from './useExpenses';
import { getDateRange } from '../utils/dateUtils';
import { EXPENSE_MAIN_CATEGORIES } from '../utils/constants';

export const useAnalytics = (period = 7) => {
  const { expenses } = useExpenses();

  const analytics = useMemo(() => {
    const { startDate, endDate } = getDateRange(period);
    
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    // Separate income and expenses
    const incomeTransactions = filteredExpenses.filter(expense => expense.type === 'income');
    const expenseTransactions = filteredExpenses.filter(expense => expense.type === 'expense');

    const totalIncome = incomeTransactions.reduce((sum, expense) => sum + expense.amount, 0);
    const totalSpent = expenseTransactions.reduce((sum, expense) => sum + expense.amount, 0);
    const netIncome = totalIncome - totalSpent;

    // Category totals for budget analysis (NEEDS/WANTS/SAVINGS)
    const categoryTotals = expenseTransactions.reduce((acc, expense) => {
      const category = expense.category || 'WANTS';
      acc[category] = (acc[category] || 0) + expense.amount;
      return acc;
    }, {});

    const avgDaily = totalSpent / period;

    // Daily data for charts
    const dailyData = [];
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayExpenses = expenseTransactions.filter(expense => {
        const expenseDate = new Date(expense.date || expense.createdAt);
        return expenseDate.toDateString() === date.toDateString();
      });
      const dayIncome = incomeTransactions.filter(expense => {
        const expenseDate = new Date(expense.date || expense.createdAt);
        return expenseDate.toDateString() === date.toDateString();
      });
      
      const totalExpense = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      const totalIncomeDay = dayIncome.reduce((sum, expense) => sum + expense.amount, 0);
      
      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        expenses: totalExpense,
        income: totalIncomeDay,
        net: totalIncomeDay - totalExpense
      });
    }

    // Pie chart data for budget categories (only expenses)
    const pieData = Object.entries(categoryTotals).map(([category, amount]) => ({
      name: EXPENSE_MAIN_CATEGORIES.find(cat => cat.value === category)?.label || category,
      value: amount,
      color: EXPENSE_MAIN_CATEGORIES.find(cat => cat.value === category)?.color || '#6b7280'
    })).filter(item => item.value > 0);

    // Budget analysis
    const budgetAnalysis = {
      needs: categoryTotals.NEEDS || 0,
      wants: categoryTotals.WANTS || 0,
      savings: categoryTotals.SAVINGS || 0,
      income: totalIncome
    };

    return {
      filteredExpenses,
      categoryTotals,
      totalSpent,
      totalIncome,
      netIncome,
      avgDaily,
      dailyData,
      pieData,
      transactionCount: filteredExpenses.length,
      budgetAnalysis
    };
  }, [expenses, period]);

  return analytics;
};