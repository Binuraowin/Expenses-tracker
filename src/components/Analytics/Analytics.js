import React, { useState } from 'react';
import { useAnalytics } from '../../hooks/useAnalytics';
import { PERIOD_OPTIONS } from '../../utils/constants';
import { TrendingUp } from 'lucide-react';
import SummaryCards from './SummaryCards';
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
          <h2 className="text-xl font-bold text-gray-800">Analytics</h2>
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

      <SummaryCards analytics={analytics} />
      <ChartComponents analytics={analytics} />
    </div>
  );
};

export default Analytics;