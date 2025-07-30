import React, { useState, useMemo } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { formatCurrency, formatDate } from '../../utils/dateUtils';
import { EXPENSE_MAIN_CATEGORIES } from '../../utils/constants';
import { exportMonthlyDataToExcel } from '../../utils/excelExport';
import { DollarSign, Trash2, RefreshCw, TrendingUp, TrendingDown, Calendar, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import Card from '../UI/Card';
import Button from '../UI/Button';

const ExpenseList = () => {
const { expenses, deleteExpense } = useExpenses();
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [exporting, setExporting] = useState(false);


  const handleExportToExcel = async () => {
    setExporting(true);
    try {
      await exportMonthlyDataToExcel(expenses, selectedMonth);
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setExporting(false);
    }
  };
  // Filter expenses by selected month
  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const expenseDate = new Date(expense.date || expense.createdAt);
      const expenseMonth = expenseDate.toISOString().slice(0, 7);
      return expenseMonth === selectedMonth;
    });
  }, [expenses, selectedMonth]);

  const sortedExpenses = [...filteredExpenses].sort((a, b) => 
    new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
  );

  const getCategoryInfo = (category, type) => {
    if (type === 'income') {
      return {
        color: '#22c55e',
        label: 'Income'
      };
    }
    const categoryData = EXPENSE_MAIN_CATEGORIES.find(cat => cat.value === category);
    return {
      color: categoryData?.color || '#6b7280',
      label: categoryData?.label || category
    };
  };

  const handleDelete = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await deleteExpense(expenseId);
      } catch (error) {
        alert('Error deleting transaction: ' + error.message);
      }
    }
  };

  // Month navigation
  const navigateMonth = (direction) => {
    const currentDate = new Date(selectedMonth + '-01');
    if (direction === 'prev') {
      currentDate.setMonth(currentDate.getMonth() - 1);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    setSelectedMonth(currentDate.toISOString().slice(0, 7));
  };

  const isCurrentMonth = selectedMonth === new Date().toISOString().slice(0, 7);

  // Calculate monthly summary
  const monthlyIncome = sortedExpenses
    .filter(exp => exp.type === 'income')
    .reduce((sum, exp) => sum + exp.amount, 0);
  
  const monthlyExpenses = sortedExpenses
    .filter(exp => exp.type === 'expense')
    .reduce((sum, exp) => sum + exp.amount, 0);

  const recurringExpenses = sortedExpenses.filter(exp => exp.isRecurring);
  const regularExpenses = sortedExpenses.filter(exp => !exp.isRecurring);

  const monthName = new Date(selectedMonth + '-01').toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long' 
  });

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
     <Card>
        <div className="flex justify-between items-center">
          <Button
            onClick={() => navigateMonth('prev')}
            variant="secondary"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Prev Month
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">{monthName}</h2>
            {isCurrentMonth && (
              <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Current Month
              </span>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Button
              onClick={handleExportToExcel}
              variant="secondary"
              size="sm"
              disabled={exporting || sortedExpenses.length === 0}
            >
              <Download className={`w-4 h-4 mr-2 ${exporting ? 'animate-bounce' : ''}`} />
              {exporting ? 'Exporting...' : 'Export Excel'}
            </Button>
            
            <Button
              onClick={() => navigateMonth('next')}
              variant="secondary"
              size="sm"
              disabled={selectedMonth >= new Date().toISOString().slice(0, 7)}
            >
              Next Month
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </Card>
      {/* Monthly Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Monthly Income</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(monthlyIncome)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Monthly Expenses</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(monthlyExpenses)}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-red-500" />
          </div>
        </Card>

        <Card className="bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Net Balance</p>
              <p className={`text-2xl font-bold ${monthlyIncome - monthlyExpenses >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                {formatCurrency(monthlyIncome - monthlyExpenses)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Recurring</p>
              <p className="text-2xl font-bold text-purple-900">{recurringExpenses.length}/{sortedExpenses.length}</p>
            </div>
            <RefreshCw className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recurring Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <RefreshCw className="w-5 h-5 mr-2 text-blue-600" />
              Recurring Transactions
            </h3>
            <span className="text-sm text-gray-500">{recurringExpenses.length} items</span>
          </div>
          
          {recurringExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recurring transactions this month</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {recurringExpenses.map((expense) => {
                const categoryInfo = getCategoryInfo(expense.category, expense.type);
                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoryInfo.color }}
                      ></div>
                      <div>
                        <h4 className="font-medium text-gray-800">{expense.description}</h4>
                        <p className="text-xs text-gray-500">{formatDate(expense.date || expense.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                      </span>
                      <p className="text-xs text-gray-500">{categoryInfo.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Regular Transactions */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-green-600" />
              One-time Transactions
            </h3>
            <span className="text-sm text-gray-500">{regularExpenses.length} items</span>
          </div>
          
          {regularExpenses.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No one-time transactions this month</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {regularExpenses.map((expense) => {
                const categoryInfo = getCategoryInfo(expense.category, expense.type);
                return (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: categoryInfo.color }}
                      ></div>
                      <div>
                        <h4 className="font-medium text-gray-800">{expense.description}</h4>
                        <p className="text-xs text-gray-500">{formatDate(expense.date || expense.createdAt)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${expense.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
                      </span>
                      <p className="text-xs text-gray-500">{categoryInfo.label}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* All Transactions List */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">All Transactions - {monthName}</h2>
          <div className="text-sm text-gray-500">
            {sortedExpenses.length} transactions
          </div>
        </div>
        
        {sortedExpenses.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No transactions recorded for {monthName}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedExpenses.map((expense) => {
              const categoryInfo = getCategoryInfo(expense.category, expense.type);
              return (
                <div 
                  key={expense.id} 
                  className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
                    expense.type === 'income' ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-red-500'
                  } ${expense.isRecurring ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center space-x-4">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: categoryInfo.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium text-gray-800">{expense.description}</h3>
                        
                        {/* Transaction Type Badge */}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          expense.type === 'income' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {expense.type === 'income' ? 'Income' : 'Expense'}
                        </span>

                        {/* Recurring Badge */}
                        {expense.isRecurring && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full flex items-center">
                            <RefreshCw className="w-3 h-3 mr-1" />
                            Recurring
                          </span>
                        )}

                        {/* Budget Category Badge */}
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {categoryInfo.label}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                        {expense.subcategory && (
                          <>
                            <span>{expense.subcategory}</span>
                            <span>•</span>
                          </>
                        )}
                        {expense.detailedCategory && (
                          <>
                            <span>{expense.detailedCategory}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{formatDate(expense.date || expense.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`font-bold text-lg ${
                      expense.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {expense.type === 'income' ? '+' : '-'}{formatCurrency(expense.amount)}
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
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ExpenseList;