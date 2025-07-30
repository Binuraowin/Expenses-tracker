import React, { useState } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { Plus } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';

const ExpenseForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'NEEDS',
    date: new Date().toISOString().split('T')[0]
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
        date: new Date().toISOString().split('T')[0]
      });
      onSuccess?.();
    } catch (error) {
      alert('Error adding expense: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <Card>
      <div className="flex items-center space-x-2 mb-6">
        <Plus className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">Add New Expense</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g., Grocery shopping"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {EXPENSE_CATEGORIES.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

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
          {loading ? 'Adding...' : 'Add Expense'}
        </Button>
      </form>
    </Card>
  );
};

export default ExpenseForm;