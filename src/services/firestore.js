import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export const firestoreService = {
  addExpense: async (userId, expenseData) => {
    try {
      const docRef = await addDoc(collection(db, 'expenses'), {
        ...expenseData,
        userId,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  },

  getUserExpenses: async (userId) => {
    try {
      const q = query(
        collection(db, 'expenses'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  },

  updateExpense: async (expenseId, updates) => {
    try {
      const expenseRef = doc(db, 'expenses', expenseId);
      await updateDoc(expenseRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  },

  deleteExpense: async (expenseId) => {
    try {
      await deleteDoc(doc(db, 'expenses', expenseId));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }
};
