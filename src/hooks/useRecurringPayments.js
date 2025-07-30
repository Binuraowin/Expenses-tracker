/* eslint-disable react-hooks/exhaustive-deps */
import { useContext, useEffect } from 'react';
import { RecurringPaymentContext } from '../contexts/RecurringPaymentContext';

export const useRecurringPayments = () => {
  const context = useContext(RecurringPaymentContext);
  if (!context) {
    throw new Error('useRecurringPayments must be used within a RecurringPaymentProvider');
  }

  useEffect(() => {
    // Only set up timers, don't load immediately
    const checkAndRefreshStatuses = () => {
      context.loadRecurringPayments();
    };

    // Check every hour for status updates
    const interval = setInterval(checkAndRefreshStatuses, 60 * 60 * 1000);

    // Check at midnight for new billing cycle
    const now = new Date();
    const msUntilMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1) - now;
    const midnightTimeout = setTimeout(() => {
      checkAndRefreshStatuses();
    }, msUntilMidnight);

    return () => {
      clearInterval(interval);
      clearTimeout(midnightTimeout);
    };
  }, []);

  return context;
};