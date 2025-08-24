/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useState, useEffect, useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { recurringPaymentService } from '../services/recurringPayments';
import { firestoreService } from '../services/firestore';
import { BUDGET_CATEGORY_MAPPING } from '../utils/constants';

export const RecurringPaymentContext = createContext();

export const RecurringPaymentProvider = ({ children }) => {
  const [recurringPayments, setRecurringPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      console.log('User found, loading recurring payments for:', user.uid);
      loadRecurringPayments();
    } else {
      console.log('No user found, clearing recurring payments');
      setRecurringPayments([]);
    }
  }, [user]);

  const loadRecurringPayments = async () => {
    if (!user) {
      console.log('loadRecurringPayments: No user available');
      return;
    }
    
    console.log('loadRecurringPayments: Starting to load for user:', user.uid);
    setLoading(true);
    try {
      const data = await recurringPaymentService.getUserRecurringPayments(user.uid);
      console.log('loadRecurringPayments: Loaded', data.length, 'payments:', data);
      setRecurringPayments(data);
    } catch (error) {
      console.error('Error loading recurring payments:', error);
      // Initialize with empty array if error
      setRecurringPayments([]);
    } finally {
      setLoading(false);
      console.log('loadRecurringPayments: Loading finished');
    }
  };

  const addRecurringPayment = async (paymentData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      console.log('Adding recurring payment:', paymentData);
      const paymentId = await recurringPaymentService.addRecurringPayment(user.uid, paymentData);
      const newPayment = {
        id: paymentId,
        ...paymentData,
        userId: user.uid,
        status: 'pending',
        createdAt: new Date()
      };
      setRecurringPayments(prev => [...prev, newPayment]);
      console.log('Successfully added recurring payment:', newPayment);
      return newPayment;
    } catch (error) {
      console.error('Error adding recurring payment:', error);
      throw error;
    }
  };

  const updateRecurringPayment = async (paymentId, updates) => {
    try {
      await recurringPaymentService.updateRecurringPayment(paymentId, updates);
      setRecurringPayments(prev => prev.map(payment => 
        payment.id === paymentId 
          ? { ...payment, ...updates, updatedAt: new Date() }
          : payment
      ));
    } catch (error) {
      console.error('Error updating recurring payment:', error);
      throw error;
    }
  };

  const markAsPaid = async (paymentId, paymentDate = new Date().toISOString().split('T')[0]) => {
    try {
      const payment = recurringPayments.find(p => p.id === paymentId);
      if (!payment) throw new Error('Payment not found');

      const validPaymentDate = paymentDate || new Date().toISOString().split('T')[0];
      console.log('Marking payment as paid:', paymentId, validPaymentDate);
      
      // Mark as paid with early payment detection
      await recurringPaymentService.markAsPaid(paymentId, validPaymentDate);
      
      // Calculate early payment status
      const paidDate = new Date(validPaymentDate);
      const currentMonth = new Date().getFullYear() * 12 + new Date().getMonth();
      const paidMonth = paidDate.getFullYear() * 12 + paidDate.getMonth();
      const isEarlyPayment = paidMonth < currentMonth;
      
      // For income transactions, don't use budget category mapping
      let finalCategory;
      if (payment.type === 'income') {
        finalCategory = 'INCOME'; // Keep income separate
      } else {
        finalCategory = BUDGET_CATEGORY_MAPPING[payment.category] || 'WANTS';
      }
      
      // Add to main expenses
      try {
        await firestoreService.addExpense(user.uid, {
          description: payment.description,
          amount: payment.amount,
          category: finalCategory,
          subcategory: payment.subcategory || '',
          detailedCategory: payment.category,
          date: validPaymentDate,
          type: payment.type || 'expense',
          isRecurring: true,
          recurringId: paymentId,
          paidEarly: isEarlyPayment
        });
        console.log('Successfully added to expenses');
      } catch (expenseError) {
        console.warn('Could not add to expenses:', expenseError);
      }

      // Update local state
      setRecurringPayments(prev => prev.map(p => 
        p.id === paymentId 
          ? { 
              ...p, 
              status: 'paid', 
              lastPaid: validPaymentDate,
              paidEarly: isEarlyPayment 
            }
          : p
      ));
      console.log('Successfully marked payment as paid');
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      throw error;
    }
  };

  const deleteRecurringPayment = async (paymentId) => {
    try {
      await recurringPaymentService.deleteRecurringPayment(paymentId);
      setRecurringPayments(prev => prev.filter(payment => payment.id !== paymentId));
    } catch (error) {
      console.error('Error deleting recurring payment:', error);
      throw error;
    }
  };

  const getMonthlyRecurringTotal = () => {
    return recurringPayments.reduce((sum, payment) => {
      if (payment.type === 'income') return sum; // Don't count income in expenses
      if (payment.frequency === 'monthly') return sum + payment.amount;
      if (payment.frequency === 'yearly') return sum + (payment.amount / 12);
      if (payment.frequency === 'weekly') return sum + (payment.amount * 4);
      return sum;
    }, 0);
  };

  const getPendingRecurringPayments = () => {
    return recurringPayments.filter(payment => 
      payment.status === 'pending' || payment.status === 'overdue'
    );
  };

  const value = useMemo(() => ({
    recurringPayments,
    loading,
    addRecurringPayment,
    updateRecurringPayment,
    markAsPaid,
    deleteRecurringPayment,
    loadRecurringPayments,
    getMonthlyRecurringTotal,
    getPendingRecurringPayments
  }), [recurringPayments, loading]); // Only re-create when these change

  return (
    <RecurringPaymentContext.Provider value={value}>
      {children}
    </RecurringPaymentContext.Provider>
  );
};