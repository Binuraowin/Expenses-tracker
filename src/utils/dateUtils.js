export const getDateRange = (days) => {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  return { startDate, endDate };
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR'
  }).format(amount);
};

export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  return checkDate.toDateString() === today.toDateString();
};

export const isThisWeek = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
  return checkDate >= startOfWeek;
};

// New utilities for recurring payments
export const getCurrentMonthId = () => {
  const now = new Date();
  return now.getFullYear() * 12 + now.getMonth();
};

export const getMonthIdFromDate = (date) => {
  const d = new Date(date);
  return d.getFullYear() * 12 + d.getMonth();
};

export const isNewMonth = (lastPaidDate) => {
  if (!lastPaidDate) return true;
  const lastPaidMonthId = getMonthIdFromDate(lastPaidDate);
  const currentMonthId = getCurrentMonthId();
  return currentMonthId > lastPaidMonthId;
};

export const isOverdue = (dueDate, status) => {
  const now = new Date();
  const currentDay = now.getDate();
  return status === 'pending' && currentDay > dueDate;
};

export const getNextDueDate = (dueDate, frequency = 'monthly') => {
  const now = new Date();
  const nextDue = new Date(now.getFullYear(), now.getMonth(), dueDate);
  
  // If due date has passed this month, move to next month
  if (nextDue <= now) {
    nextDue.setMonth(nextDue.getMonth() + 1);
  }
  
  switch (frequency) {
    case 'yearly':
      nextDue.setFullYear(nextDue.getFullYear() + 1);
      break;
    case 'weekly':
      nextDue.setDate(nextDue.getDate() + 7);
      break;
    default: // monthly
      // Already handled above
      break;
  }
  
  return nextDue;
};

export const getDaysUntilDue = (dueDate) => {
  const now = new Date();
  const nextDue = getNextDueDate(dueDate);
  const diffTime = nextDue - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};