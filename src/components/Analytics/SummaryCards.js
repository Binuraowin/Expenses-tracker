import React from 'react';
import { DollarSign, Calendar, PieChart } from 'lucide-react';
import { formatCurrency } from '../../utils/dateUtils';
import Card from '../UI/Card';

const SummaryCards = ({ analytics }) => {
  const { totalSpent, avgDaily, transactionCount } = analytics;

  const cards = [
    {
      title: 'Total Spent',
      value: formatCurrency(totalSpent),
      icon: DollarSign,
      color: 'text-green-500'
    },
    {
      title: 'Daily Average',
      value: formatCurrency(avgDaily),
      icon: Calendar,
      color: 'text-blue-500'
    },
    {
      title: 'Transactions',
      value: transactionCount,
      icon: PieChart,
      color: 'text-purple-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {cards.map((card, index) => (
        <Card key={index} className="card-hover">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">{card.title}</p>
              <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            </div>
            <card.icon className={`w-10 h-10 ${card.color}`} />
          </div>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCards;