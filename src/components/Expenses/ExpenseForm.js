import React, { useState } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { EXPENSE_MAIN_CATEGORIES } from '../../utils/constants';
import { Plus } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';

const ExpenseForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'NEEDS',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    isSalary: false
  });
  const [loading, setLoading] = useState(false);
  const { addExpense } = useExpenses();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      });
      setFormData({
        description: '',
        amount: '',
        category: 'NEEDS',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        isSalary: false
      });
      onSuccess?.();
    } catch (error) {
      alert('Error adding transaction: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  return (
    <Card>
      <div className="flex items-center space-x-2 mb-6">
        <Plus className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Add New Transaction</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g., Salary, Grocery shopping"
            required
          />

          <Input
            label="Amount (Rs.)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="expense">Expense (-)</option>
              <option value="income">Income (+)</option>
            </select>
            
            {/* Salary checkbox when income is selected */}
            {formData.type === 'income' && (
              <div className="mt-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isSalary"
                    checked={formData.isSalary}
                    onChange={handleChange}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">This is my salary</span>
                </label>
              </div>
            )}
          </div>

          {formData.type === 'expense' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {EXPENSE_MAIN_CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Input
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
          variant="primary"
        >
          {loading ? 'Adding...' : `Add ${formData.type === 'income' ? 'Income' : 'Expense'}`}
        </Button>
      </form>
    </Card>
  );
};

export default ExpenseForm;