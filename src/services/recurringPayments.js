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

export const recurringPaymentService = {
  // Add Recurring Payment
  addRecurringPayment: async (userId, paymentData) => {
    try {
      const docRef = await addDoc(collection(db, 'recurringPayments'), {
        ...paymentData,
        userId,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastPaidMonth: null,
        nextDueDate: null
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding recurring payment:', error);
      throw error;
    }
  },

  // Get User Recurring Payments (Fixed the error)
  getUserRecurringPayments: async (userId) => {
    try {
      const q = query(
        collection(db, 'recurringPayments'),
        where('userId', '==', userId),
        orderBy('dueDate', 'asc')
      );
      const querySnapshot = await getDocs(q);
      const payments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || doc.data().createdAt,
        updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || doc.data().updatedAt
      }));

      // Update status for each payment (fixed the 'this' reference error)
      const updatedPayments = [];
      for (const payment of payments) {
        const updatedStatus = calculatePaymentStatus(payment);
        if (updatedStatus !== payment.status) {
          await recurringPaymentService.updateRecurringPayment(payment.id, { status: updatedStatus });
          updatedPayments.push({ ...payment, status: updatedStatus });
        } else {
          updatedPayments.push(payment);
        }
      }

      return updatedPayments;
    } catch (error) {
      console.error('Error fetching recurring payments:', error);
      throw error;
    }
  },

  // Update Recurring Payment
  updateRecurringPayment: async (paymentId, updates) => {
    try {
      const paymentRef = doc(db, 'recurringPayments', paymentId);
      await updateDoc(paymentRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating recurring payment:', error);
      throw error;
    }
  },

  // Mark Payment as Paid
  markAsPaid: async (paymentId, paymentDate = new Date().toISOString().split('T')[0]) => {
    try {
      const paidDate = new Date(paymentDate);
      const paidMonth = paidDate.getFullYear() * 12 + paidDate.getMonth();
      
      const paymentRef = doc(db, 'recurringPayments', paymentId);
      await updateDoc(paymentRef, {
        status: 'paid',
        lastPaid: paymentDate,
        lastPaidMonth: paidMonth,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      throw error;
    }
  },

  // Delete Recurring Payment
  deleteRecurringPayment: async (paymentId) => {
    try {
      await deleteDoc(doc(db, 'recurringPayments', paymentId));
    } catch (error) {
      console.error('Error deleting recurring payment:', error);
      throw error;
    }
  }
};

// Helper function (moved outside the object to fix 'this' reference error)
const calculatePaymentStatus = (payment) => {
  const now = new Date();
  const currentMonth = now.getFullYear() * 12 + now.getMonth();
  const currentDay = now.getDate();

  if (!payment.lastPaidMonth) {
    if (payment.frequency === 'monthly' && currentDay > payment.dueDate) {
      return 'overdue';
    }
    return 'pending';
  }

  const lastPaidMonth = payment.lastPaidMonth;

  switch (payment.frequency) {
    case 'monthly':
      if (currentMonth > lastPaidMonth) {
        return currentDay > payment.dueDate ? 'overdue' : 'pending';
      }
      return payment.status;

    case 'yearly':
      const yearsDiff = Math.floor((currentMonth - lastPaidMonth) / 12);
      if (yearsDiff >= 1) {
        return currentDay > payment.dueDate ? 'overdue' : 'pending';
      }
      return payment.status;

    case 'weekly':
      if (payment.lastPaid) {
        const weeksDiff = Math.floor((now - new Date(payment.lastPaid)) / (7 * 24 * 60 * 60 * 1000));
        if (weeksDiff >= 1) {
          return 'pending';
        }
      }
      return payment.status;

    default:
      return payment.status;
  }
};