import React from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { DollarSign, Trash2 } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';

const ExpenseList = () => {
  const { expenses, deleteExpense } = useExpenses();

  const sortedExpenses = [...expenses].sort((a, b) => 
    new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
  );

  const getCategoryColor = (category) => {
    switch (category) {
      case 'NEEDS': return 'bg-red-100 text-red-800';
      case 'WANTS': return 'bg-orange-100 text-orange-800';
      case 'SAVINGS': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(expenseId);
      } catch (error) {
        alert('Error deleting expense: ' + error.message);
      }
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold text-gray-800 mb-6">Recent Expenses</h2>
      
      {sortedExpenses.length === 0 ? (
        <div className="text-center py-12">
          <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No expenses recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedExpenses.slice(0, 10).map((expense) => (
            <div 
              key={expense.id} 
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="font-medium text-gray-800">{expense.description}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                    {expense.category}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDate(expense.date || expense.createdAt)}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="font-bold text-lg text-gray-800">
                  {formatCurrency(expense.amount)}
                </span>
                <Button
                  onClick={() => handleDelete(expense.id)}
                  variant="danger"
                  size="sm"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          
          {sortedExpenses.length > 10 && (
            <div className="text-center pt-4">
              <p className="text-gray-500 text-sm">
                Showing latest 10 expenses. Total: {sortedExpenses.length}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default ExpenseList;