import React, { useState } from 'react';
import ExpenseForm from '../components/Expenses/ExpenseForm';
import ExpenseList from '../components/Expenses/ExpenseList';
import Analytics from '../components/Analytics/Analytics';
import { BarChart3, Plus, List } from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'add', label: 'Add Expense', icon: Plus },
    { id: 'list', label: 'Expense List', icon: List }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Analytics />;
      case 'add':
        return (
          <div className="max-w-2xl mx-auto">
            <ExpenseForm onSuccess={() => setActiveTab('list')} />
          </div>
        );
      case 'list':
        return <ExpenseList />;
      default:
        return <Analytics />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-sm p-1">
        <div className="flex space-x-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 flex-1 justify-center ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};

export default Dashboard;