export const EXPENSE_CATEGORIES = {
  LOANS: {
    label: 'Loans & Finance',
    color: '#ef4444',
    subcategories: ['Housing Loan', 'Student Loan', 'Personal Loan', 'Credit Card', 'Vehicle Loan']
  },
  UTILITIES: {
    label: 'Utilities & Bills',
    color: '#3b82f6',
    subcategories: ['Electricity', 'Water', 'Internet', 'Phone', 'TV/Streaming', 'Gas']
  },
  FOOD: {
    label: 'Food & Dining',
    color: '#10b981',
    subcategories: ['Groceries', 'Restaurants', 'Delivery', 'Snacks', 'Beverages']
  },
  TRANSPORT: {
    label: 'Transportation',
    color: '#f59e0b',
    subcategories: ['Public Transport', 'Fuel', 'Vehicle Service', 'Insurance', 'Parking', 'Taxi/Uber']
  },
  HEALTHCARE: {
    label: 'Healthcare',
    color: '#8b5cf6',
    subcategories: ['Medical', 'Dental', 'Pharmacy', 'Insurance', 'Gym/Fitness']
  },
  ENTERTAINMENT: {
    label: 'Entertainment',
    color: '#ec4899',
    subcategories: ['Movies', 'Games', 'Sports', 'Hobbies', 'Subscriptions']
  },
  SHOPPING: {
    label: 'Shopping',
    color: '#06b6d4',
    subcategories: ['Clothing', 'Electronics', 'Home & Garden', 'Personal Care', 'Books']
  },
  EDUCATION: {
    label: 'Education',
    color: '#84cc16',
    subcategories: ['Courses', 'Books', 'Software', 'Certification']
  },
  INCOME: {
    label: 'Income',
    color: '#22c55e',
    subcategories: ['Salary', 'Freelance', 'Investment', 'Bonus', 'Other Income']
  },
  OTHER: {
    label: 'Other',
    color: '#6b7280',
    subcategories: ['Miscellaneous', 'Gifts', 'Charity', 'Emergency']
  }
};

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
  SCHEDULED: 'scheduled'
};

// Budget categorization mapping
export const BUDGET_CATEGORY_MAPPING = {
  LOANS: 'NEEDS',
  UTILITIES: 'NEEDS',
  FOOD: 'NEEDS',
  TRANSPORT: 'NEEDS',
  HEALTHCARE: 'NEEDS',
  ENTERTAINMENT: 'WANTS',
  SHOPPING: 'WANTS',
  EDUCATION: 'WANTS',
  INCOME: 'INCOME',
  OTHER: 'WANTS'
};

export const BUDGET_PERCENTAGES = {
  NEEDS: 0.5,
  WANTS: 0.3,
  SAVINGS: 0.2
};

export const EXPENSE_MAIN_CATEGORIES = [
  { value: 'NEEDS', label: 'Needs (50%)', color: '#ef4444', bgColor: 'bg-red-500' },
  { value: 'WANTS', label: 'Wants (30%)', color: '#f97316', bgColor: 'bg-orange-500' },
  { value: 'SAVINGS', label: 'Savings (20%)', color: '#3b82f6', bgColor: 'bg-blue-500' }
];

export const PERIOD_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 365, label: 'Last 365 days' }
];

export const CURRENCY = 'LKR';
export const LOCALE = 'en-LK';