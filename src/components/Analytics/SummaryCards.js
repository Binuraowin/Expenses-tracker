import React from 'react';
import { DollarSign, Calendar, PieChart, RefreshCw, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/dateUtils';
import Card from '../UI/Card';

const SummaryCards = ({ analytics }) => {
  const { 
    totalSpent, 
    avgDaily, 
    transactionCount, 
    totalIncome,
    monthlyRecurringTotal,
    pendingRecurringTotal,
    pendingRecurringCount
  } = analytics;

  const netBalance = totalIncome - totalSpent;

  const cards = [
    {
      title: 'Total Income',
      value: formatCurrency(totalIncome || 0),
      icon: TrendingUp,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-900'
    },
    {
      title: 'Total Expenses',
      value: formatCurrency(totalSpent),
      icon: DollarSign,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-900'
    },
    {
      title: 'Net Balance',
      value: formatCurrency(netBalance),
      icon: Calendar,
      color: netBalance >= 0 ? 'text-green-500' : 'text-red-500',
      bgColor: netBalance >= 0 ? 'bg-green-50' : 'bg-red-50',
      textColor: netBalance >= 0 ? 'text-green-900' : 'text-red-900'
    },
    {
      title: 'Monthly Recurring',
      value: formatCurrency(monthlyRecurringTotal || 0),
      icon: RefreshCw,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      subtitle: `${pendingRecurringCount || 0} pending`
    },
    {
      title: 'Daily Average',
      value: formatCurrency(avgDaily),
      icon: Calendar,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-900'
    },
    {
      title: 'Transactions',
      value: transactionCount,
      icon: PieChart,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className={`card-hover ${card.bgColor}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">{card.title}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
              {card.subtitle && (
                <p className="text-xs text-gray-500 mt-1">{card.subtitle}</p>
              )}
            </div>
            <card.icon className={`w-10 h-10 ${card.color}`} />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCards;