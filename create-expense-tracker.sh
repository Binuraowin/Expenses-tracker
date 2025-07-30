#!/bin/bash

echo "Creating Expense Tracker Project Structure..."

# Create project directory
mkdir -p expense-tracker
cd expense-tracker

# Create folder structure
mkdir -p public
mkdir -p src/{components/{Auth,Expenses,Analytics,Layout,UI},contexts,services,hooks,utils,pages,styles}

# Create package.json
cat > package.json << 'EOF'
{
  "name": "expense-tracker",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "@testing-library/jest-dom": "^5.17.0",
    "@testing-library/react": "^13.4.0",
    "@testing-library/user-event": "^13.5.0",
    "firebase": "^10.7.1",
    "lucide-react": "^0.263.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "recharts": "^2.8.0",
    "web-vitals": "^2.1.4"
  },
  "devDependencies": {
    "@tailwindcss/forms": "^0.5.6",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

# Create .env file
cat > .env << 'EOF'
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
EOF

# Create tailwind.config.js
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
EOF

# Create postcss.config.js
cat > postcss.config.js << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create public/index.html
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="icon" href="%PUBLIC_URL%/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="Personal Expense Tracker with Firebase" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <title>Expense Tracker</title>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root"></div>
  </body>
</html>
EOF

# Create .gitignore
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
.DS_Store
EOF

# Create README.md
cat > README.md << 'EOF'
# Expense Tracker

A modern expense tracking application built with React and Firebase.

## Features
- Firebase Authentication (Google + Email/Password)
- Real-time expense tracking with Firestore
- Analytics dashboard with 7/30/365 day periods
- Category-based expense management (Needs/Wants/Savings)
- Interactive charts and visualizations
- Responsive design with Tailwind CSS

## Setup
1. Install dependencies: `npm install`
2. Configure Firebase in `.env` file
3. Start development server: `npm start`

## Firebase Setup
1. Create a new Firebase project
2. Enable Authentication (Email/Password and Google)
3. Create Firestore database
4. Update `.env` with your Firebase config
EOF

# Create src/index.js
cat > src/index.js << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
EOF

# Create src/App.js
cat > src/App.js << 'EOF'
import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { useAuth } from './hooks/useAuth';
import LoginForm from './components/Auth/LoginForm';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard';
import './App.css';

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return (
    <ExpenseProvider>
      <Layout>
        <Dashboard />
      </Layout>
    </ExpenseProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
EOF

# Create src/App.css
cat > src/App.css << 'EOF'
/* App-specific styles */
.App {
  text-align: center;
}

/* Additional custom styles can be added here */
EOF

# Create src/styles/globals.css
cat > src/styles/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
  line-height: 1.6;
  color: #374151;
  background-color: #f9fafb;
}

.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.card-hover {
  transition: transform 0.2s ease-in-out;
}

.card-hover:hover {
  transform: translateY(-2px);
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
EOF

# Create services files
cat > src/services/firebase.js << 'EOF'
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
EOF

cat > src/services/auth.js << 'EOF'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

export const authService = {
  signInWithEmail: (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  },

  signUpWithEmail: (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  },

  signInWithGoogle: () => {
    return signInWithPopup(auth, googleProvider);
  },

  signOut: () => {
    return firebaseSignOut(auth);
  },

  onAuthStateChanged: (callback) => {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser: () => {
    return auth.currentUser;
  }
};
EOF

cat > src/services/firestore.js << 'EOF'
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
EOF

# Create utils files
cat > src/utils/constants.js << 'EOF'
export const EXPENSE_CATEGORIES = [
  { value: 'NEEDS', label: 'Needs (50%)', color: '#ef4444', bgColor: 'bg-red-500' },
  { value: 'WANTS', label: 'Wants (30%)', color: '#f97316', bgColor: 'bg-orange-500' },
  { value: 'SAVINGS', label: 'Savings (20%)', color: '#3b82f6', bgColor: 'bg-blue-500' }
];

export const BUDGET_PERCENTAGES = {
  NEEDS: 0.5,
  WANTS: 0.3,
  SAVINGS: 0.2
};

export const PERIOD_OPTIONS = [
  { value: 7, label: 'Last 7 days' },
  { value: 30, label: 'Last 30 days' },
  { value: 365, label: 'Last 365 days' }
];

export const CURRENCY = 'LKR';
export const LOCALE = 'en-LK';
EOF

cat > src/utils/dateUtils.js << 'EOF'
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
EOF

# Create placeholder files for components (with basic structure)
echo "// LoginForm component - Add authentication UI here" > src/components/Auth/LoginForm.js
echo "// ExpenseForm component - Add expense form here" > src/components/Expenses/ExpenseForm.js
echo "// ExpenseList component - Add expense list here" > src/components/Expenses/ExpenseList.js
echo "// Analytics component - Add analytics dashboard here" > src/components/Analytics/Analytics.js
echo "// SummaryCards component - Add summary cards here" > src/components/Analytics/SummaryCards.js
echo "// ChartComponents component - Add charts here" > src/components/Analytics/ChartComponents.js
echo "// Header component - Add header here" > src/components/Layout/Header.js
echo "// Layout component - Add layout wrapper here" > src/components/Layout/Layout.js
echo "// Button component - Add reusable button here" > src/components/UI/Button.js
echo "// Input component - Add reusable input here" > src/components/UI/Input.js
echo "// Card component - Add reusable card here" > src/components/UI/Card.js
echo "// AuthContext - Add authentication context here" > src/contexts/AuthContext.js
echo "// ExpenseContext - Add expense context here" > src/contexts/ExpenseContext.js
echo "// useAuth hook - Add authentication hook here" > src/hooks/useAuth.js
echo "// useExpenses hook - Add expenses hook here" > src/hooks/useExpenses.js
echo "// useAnalytics hook - Add analytics hook here" > src/hooks/useAnalytics.js
echo "// Dashboard page - Add main dashboard here" > src/pages/Dashboard.js

# Create installation script
cat > install-dependencies.sh << 'EOF'
#!/bin/bash
echo "Installing dependencies..."
npm install
echo ""
echo "Dependencies installed successfully!"
echo "Next steps:"
echo "1. Configure Firebase in .env file"
echo "2. Add component code from documentation"
echo "3. Run 'npm start' to start development server"
EOF

chmod +x install-dependencies.sh

# Create script to show next steps
cat > next-steps.sh << 'EOF'
#!/bin/bash
echo "==============================================="
echo "Expense Tracker Project Structure Created!"
echo "==============================================="
echo ""
echo "Project created in: $(pwd)"
echo ""
echo "Next steps:"
echo "1. Run: ./install-dependencies.sh"
echo "2. Copy component code from documentation"
echo "3. Configure Firebase in .env file"
echo "4. Run: npm start"
echo ""
echo "Files created:"
echo "- Complete folder structure"
echo "- package.json with all dependencies"
echo "- Tailwind CSS configuration"
echo "- Environment file template"
echo "- Basic component files"
echo "- Firebase service files"
echo "- Utility files"
echo ""
echo "==============================================="
EOF

chmod +x next-steps.sh

echo ""
echo "==============================================="
echo "✅ Expense Tracker Project Structure Created!"
echo "==============================================="
echo ""
echo "📁 Project created in: $(pwd)"
echo ""
echo "🚀 Next steps:"
echo "1. Run: ./install-dependencies.sh"
echo "2. Copy component code from documentation"
echo "3. Configure Firebase in .env file"
echo "4. Run: npm start"
echo ""
echo "📦 What was created:"
echo "- Complete folder structure"
echo "- package.json with all dependencies"
echo "- Tailwind CSS configuration"
echo "- Environment file template"
echo "- Firebase service files"
echo "- Utility files and basic structure"
echo ""
echo "==============================================="