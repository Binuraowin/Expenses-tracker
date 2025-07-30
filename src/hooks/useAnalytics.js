import { useMemo } from 'react';
import { useExpenses } from './useExpenses';
import { getDateRange, formatCurrency } from '../utils/dateUtils';

export const useAnalytics = (period = 7) => {
  const { expenses } = useExpenses();

  const analytics = useMemo(() => {
    const { startDate, endDate } = getDateRange(period);
    
    const filteredExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      return expenseDate >= startDate && expenseDate <= endDate;
    });

    const categoryTotals = filteredExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {});

    const totalSpent = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const avgDaily = totalSpent / period;

    const dailyData = [];
    for (let i = period - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayExpenses = filteredExpenses.filter(expense => {
        const expenseDate = new Date(expense.date || expense.createdAt);
        return expenseDate.toDateString() === date.toDateString();
      });
      const total = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: total
      });
    }

    const pieData = Object.entries(categoryTotals).map(([category, amount]) => ({
      name: category,
      value: amount,
      color: getCategoryColor(category)
    }));

    return {
      filteredExpenses,
      categoryTotals,
      totalSpent,
      avgDaily,
      dailyData,
      pieData,
      transactionCount: filteredExpenses.length
    };
  }, [expenses, period]);

  return analytics;
};

const getCategoryColor = (category) => {
  switch (category) {
    case 'NEEDS': return '#ef4444';
    case 'WANTS': return '#f97316';
    case 'SAVINGS': return '#3b82f6';
    default: return '#6b7280';
  }
};