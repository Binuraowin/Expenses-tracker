import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { firestoreService } from '../services/firestore';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadExpenses();
    }
  }, [user]);

  const loadExpenses = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const data = await firestoreService.getUserExpenses(user.uid);
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expenseData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const expenseId = await firestoreService.addExpense(user.uid, expenseData);
      const newExpense = {
        id: expenseId,
        ...expenseData,
        userId: user.uid,
        createdAt: new Date()
      };
      setExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  };

  const updateExpense = async (expenseId, updates) => {
    try {
      await firestoreService.updateExpense(expenseId, updates);
      setExpenses(prev => prev.map(expense => 
        expense.id === expenseId 
          ? { ...expense, ...updates, updatedAt: new Date() }
          : expense
      ));
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  };

  const deleteExpense = async (expenseId) => {
    try {
      await firestoreService.deleteExpense(expenseId);
      setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  };

  const value = {
    expenses,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    loadExpenses
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
};