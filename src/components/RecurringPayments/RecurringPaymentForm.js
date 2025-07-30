import { useState } from 'react';
import { useRecurringPayments } from '../../hooks/useRecurringPayments';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Card from '../UI/Card';

const RecurringPaymentForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'UTILITIES',
    subcategory: '',
    frequency: 'monthly',
    dueDate: 1,
    type: 'expense' // Add type field
  });
  const { addRecurringPayment } = useRecurringPayments();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addRecurringPayment({
        ...formData,
        amount: parseFloat(formData.amount),
        dueDate: parseInt(formData.dueDate)
      });
      onClose();
    } catch (error) {
      alert('Error adding recurring payment: ' + error.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'category' ? { subcategory: '' } : {})
    }));
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-800">Add Recurring Transaction</h3>
        <Button onClick={onClose} variant="secondary" size="sm">Cancel</Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g., Salary, Internet Bill"
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
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Object.entries(EXPENSE_CATEGORIES).map(([key, category]) => (
                <option key={key} value={key}>{category.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
            <select
              name="frequency"
              value={formData.frequency}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>

          <Input
            label="Due Date (Day)"
            name="dueDate"
            type="number"
            value={formData.dueDate}
            onChange={handleChange}
            min="1"
            max="31"
            required
          />
        </div>

        <Button type="submit" className="w-full">
          Add Recurring {formData.type === 'income' ? 'Income' : 'Payment'}
        </Button>
      </form>
    </Card>
  );
};

export default RecurringPaymentForm;