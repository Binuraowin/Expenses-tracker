import React, { useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { PERIOD_OPTIONS } from '../../utils/constants';
import { TrendingUp, DollarSign, Calendar, PieChart } from 'lucide-react';
import ChartComponents from './ChartComponents';
import Card from '../UI/Card';

const Analytics = () => {
  const [period, setPeriod] = useState(7);
  const analytics = useAnalytics(period);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Financial Overview</h2>
        </div>
        
        <select
          value={period}
          onChange={(e) => setPeriod(parseInt(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {PERIOD_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-green-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-900">Rs. {analytics.totalIncome.toLocaleString()}</p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-500" />
          </div>
        </Card>

        <Card className="bg-red-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-900">Rs. {analytics.totalSpent.toLocaleString()}</p>
            </div>
            <DollarSign className="w-10 h-10 text-red-500" />
          </div>
        </Card>

        <Card className={`${analytics.netIncome >= 0 ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${analytics.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Net Income
              </p>
              <p className={`text-2xl font-bold ${analytics.netIncome >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                Rs. {analytics.netIncome.toLocaleString()}
              </p>
            </div>
            <Calendar className={`w-10 h-10 ${analytics.netIncome >= 0 ? 'text-green-500' : 'text-red-500'}`} />
          </div>
        </Card>

        <Card className="bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Transactions</p>
              <p className="text-2xl font-bold text-blue-900">{analytics.transactionCount}</p>
            </div>
            <PieChart className="w-10 h-10 text-blue-500" />
          </div>
        </Card>
      </div>
      
      {/* Charts */}
      <ChartComponents analytics={analytics} />
    </div>
  );
};

export default Analytics;