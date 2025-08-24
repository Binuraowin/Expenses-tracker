import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  writeBatch
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
        nextDueDate: null,
        paidEarly: false,
        earlyPaymentDate: null
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding recurring payment:', error);
      throw error;
    }
  },

  // Get User Recurring Payments
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

      // Update status for each payment using batch
      const batch = writeBatch(db);
      const updatedPayments = [];
      let hasUpdates = false;

      for (const payment of payments) {
        const updatedStatus = calculatePaymentStatus(payment);
        if (updatedStatus !== payment.status) {
          const paymentRef = doc(db, 'recurringPayments', payment.id);
          batch.update(paymentRef, { 
            status: updatedStatus,
            updatedAt: serverTimestamp()
          });
          updatedPayments.push({ ...payment, status: updatedStatus });
          hasUpdates = true;
        } else {
          updatedPayments.push(payment);
        }
      }

      // Commit batch updates if any
      if (hasUpdates) {
        await batch.commit();
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

  // Mark Payment as Paid with Early Payment Detection
  markAsPaid: async (paymentId, paymentDate = new Date().toISOString().split('T')[0]) => {
    try {
      console.log('Starting markAsPaid for:', paymentId, paymentDate);
      
      // Get payment data first
      const paymentRef = doc(db, 'recurringPayments', paymentId);
      const paymentDoc = await getDoc(paymentRef);
      
      if (!paymentDoc.exists()) {
        throw new Error('Payment not found');
      }
      
      const paymentData = paymentDoc.data();
      console.log('Payment data:', paymentData);
      
      const paidDate = new Date(paymentDate);
      const paidMonth = paidDate.getFullYear() * 12 + paidDate.getMonth();
      
      // Simple early payment detection based on your use case
      const now = new Date();
      const currentDay = now.getDate();
      
      // If paying after getting salary (around 22nd-25th) for next month's bills
      let isEarlyPayment = false;
      if (currentDay >= 22 && paymentData.dueDate <= 15) {
        // Paying next month's bills with this month's salary
        isEarlyPayment = true;
      }
      
      console.log('Early payment detection:', { currentDay, dueDate: paymentData.dueDate, isEarlyPayment });
      
      // Update the payment
      await updateDoc(paymentRef, {
        status: 'paid',
        lastPaid: paymentDate,
        lastPaidMonth: paidMonth,
        paidEarly: isEarlyPayment,
        earlyPaymentDate: isEarlyPayment ? paymentDate : null,
        updatedAt: serverTimestamp()
      });
      
      console.log(`Payment ${paymentId} marked as paid. Early: ${isEarlyPayment}`);
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      throw error;
    }
  },

  // End Month and Start Next
  endMonthAndStartNext: async (userId) => {
    try {
      const q = query(
        collection(db, 'recurringPayments'),
        where('userId', '==', userId)
      );
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      const currentMonth = new Date().getFullYear() * 100 + (new Date().getMonth() + 1);
      
      querySnapshot.docs.forEach(docSnapshot => {
        batch.update(docSnapshot.ref, {
          status: 'pending',
          lastPaidMonth: currentMonth,
          paidEarly: false,
          earlyPaymentDate: null,
          updatedAt: serverTimestamp()
        });
      });
      
      await batch.commit();
      console.log('Month ended and next month started - all payments reset');
    } catch (error) {
      console.error('Error ending month:', error);
      throw error;
    }
  },

  // Delete Recurring Payment
  deleteRecurringPayment: async (paymentId) => {
    try {
      const paymentRef = doc(db, 'recurringPayments', paymentId);
      await deleteDoc(paymentRef);
    } catch (error) {
      console.error('Error deleting recurring payment:', error);
      throw error;
    }
  }
};

// Helper function for payment status calculation
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