import { useState } from 'react';
import { useRecurringPayments } from '../../hooks/useRecurringPayments';
import { EXPENSE_CATEGORIES } from '../../utils/constants';
import { CheckCircle, Clock, AlertTriangle, XCircle, Plus, Trash2, RefreshCw } from 'lucide-react';
import Button from '../UI/Button';
import Card from '../UI/Card';
import RecurringPaymentForm from './RecurringPaymentForm';

const RecurringPaymentsList = () => {
  const { recurringPayments, markAsPaid, deleteRecurringPayment, loading, loadRecurringPayments } = useRecurringPayments();
  const [showForm, setShowForm] = useState(false);
  const [processingPayments, setProcessingPayments] = useState(new Set());
  const [refreshing, setRefreshing] = useState(false);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'overdue': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default: return <XCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentCycleInfo = (payment) => {
    if (!payment.lastPaid) return 'Never paid';
    
    const lastPaid = new Date(payment.lastPaid);
    const now = new Date();
    const currentMonth = now.getFullYear() * 12 + now.getMonth();
    const lastPaidMonth = lastPaid.getFullYear() * 12 + lastPaid.getMonth();
    
    if (payment.frequency === 'monthly') {
      if (currentMonth === lastPaidMonth) {
        return `Paid this month (${lastPaid.toLocaleDateString()})`;
      } else if (currentMonth > lastPaidMonth) {
        const monthsAgo = currentMonth - lastPaidMonth;
        return `Paid ${monthsAgo} month${monthsAgo > 1 ? 's' : ''} ago`;
      }
    }
    
    return `Last paid: ${lastPaid.toLocaleDateString()}`;
  };

  const isOverdue = (payment) => {
    const now = new Date();
    const currentDay = now.getDate();
    return payment.status === 'overdue' || (payment.status === 'pending' && currentDay > payment.dueDate);
  };

  const handleMarkAsPaid = async (paymentId) => {
    setProcessingPayments(prev => new Set(prev).add(paymentId));
    try {
      const today = new Date().toISOString().split('T')[0];
      await markAsPaid(paymentId, today);
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      alert('Error marking payment as paid: ' + error.message);
    } finally {
      setProcessingPayments(prev => {
        const newSet = new Set(prev);
        newSet.delete(paymentId);
        return newSet;
      });
    }
  };

  const handleRefreshStatuses = async () => {
    setRefreshing(true);
    try {
      await loadRecurringPayments();
    } catch (error) {
      console.error('Error refreshing statuses:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleDeletePayment = async (paymentId, description) => {
    if (window.confirm(`Are you sure you want to delete "${description}"?`)) {
      try {
        await deleteRecurringPayment(paymentId);
      } catch (error) {
        console.error('Error deleting payment:', error);
        alert('Error deleting payment: ' + error.message);
      }
    }
  };

  const pendingTotal = recurringPayments
    .filter(payment => payment.status === 'pending' || payment.status === 'overdue')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const paidTotal = recurringPayments
    .filter(payment => payment.status === 'paid')
    .reduce((sum, payment) => sum + payment.amount, 0);

  const overdueCount = recurringPayments.filter(payment => payment.status === 'overdue').length;

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2">Loading recurring payments...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-800">Recurring Payments</h2>
            {overdueCount > 0 && (
              <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                {overdueCount} Overdue
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleRefreshStatuses} 
              size="sm" 
              variant="secondary"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowForm(!showForm)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Recurring
            </Button>
          </div>
        </div>

        {/* Enhanced Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="text-yellow-800 text-sm font-medium">Pending Payments</div>
            <div className="text-2xl font-bold text-yellow-900">Rs. {pendingTotal.toLocaleString()}</div>
            <div className="text-xs text-yellow-600 mt-1">
              {recurringPayments.filter(p => p.status === 'pending').length} payments
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="text-red-800 text-sm font-medium">Overdue</div>
            <div className="text-2xl font-bold text-red-900">{overdueCount}</div>
            <div className="text-xs text-red-600 mt-1">
              Need immediate attention
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-green-800 text-sm font-medium">Paid This Month</div>
            <div className="text-2xl font-bold text-green-900">Rs. {paidTotal.toLocaleString()}</div>
            <div className="text-xs text-green-600 mt-1">
              {recurringPayments.filter(p => p.status === 'paid').length} payments
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-blue-800 text-sm font-medium">Total Monthly</div>
            <div className="text-2xl font-bold text-blue-900">Rs. {(pendingTotal + paidTotal).toLocaleString()}</div>
            <div className="text-xs text-blue-600 mt-1">
              {recurringPayments.length} total payments
            </div>
          </div>
        </div>

        {/* Monthly Cycle Explanation */}
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Monthly Cycle Status</h4>
              <p className="text-sm text-blue-700 mt-1">
                Payments automatically reset to "Pending" each month. Once paid, they remain "Paid" until the next billing cycle.
                Overdue payments are those past their due date for the current month.
              </p>
            </div>
          </div>
        </div>

        {/* Payments List - THIS WAS MISSING */}
        {recurringPayments.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No recurring payments set up yet</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Recurring Payment
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recurringPayments
              .sort((a, b) => {
                // Sort by status (overdue first, then pending, then paid)
                const statusOrder = { overdue: 0, pending: 1, paid: 2 };
                if (statusOrder[a.status] !== statusOrder[b.status]) {
                  return statusOrder[a.status] - statusOrder[b.status];
                }
                return a.dueDate - b.dueDate;
              })
              .map((payment) => (
              <div 
                key={payment.id} 
                className={`flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 ${
                  isOverdue(payment) ? 'border-red-200 bg-red-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {getStatusIcon(payment.status)}
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-800">{payment.description}</h3>
                      {isOverdue(payment) && (
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                          OVERDUE
                        </span>
                      )}
                      {payment.type === 'income' && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                          INCOME
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 mt-1">
                      <span>{EXPENSE_CATEGORIES[payment.category]?.label || payment.category}</span>
                      <span>•</span>
                      <span>Due: {payment.dueDate}th</span>
                      <span>•</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                        {payment.status.toUpperCase()}
                      </span>
                      <span>•</span>
                      <span className="text-xs">
                        {getPaymentCycleInfo(payment)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`font-bold text-lg ${
                    payment.type === 'income' ? 'text-green-600' : 'text-gray-800'
                  }`}>
                    {payment.type === 'income' ? '+' : ''}Rs. {payment.amount.toLocaleString()}
                  </span>
                  {(payment.status === 'pending' || payment.status === 'overdue') && (
                    <Button 
                      onClick={() => handleMarkAsPaid(payment.id)}
                      variant={isOverdue(payment) ? "warning" : "success"}
                      size="sm"
                      disabled={processingPayments.has(payment.id)}
                    >
                      {processingPayments.has(payment.id) ? (
                        <div className="w-4 h-4 animate-spin border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <CheckCircle className="w-4 h-4 mr-1" />
                      )}
                      {processingPayments.has(payment.id) ? 'Processing...' : 'Mark Paid'}
                    </Button>
                  )}
                  <Button 
                    onClick={() => handleDeletePayment(payment.id, payment.description)}
                    variant="danger"
                    size="sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {showForm && <RecurringPaymentForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default RecurringPaymentsList;