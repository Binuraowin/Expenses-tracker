import React from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { ExpenseProvider } from './contexts/ExpenseContext';
import { RecurringPaymentProvider } from './contexts/RecurringPaymentContext';
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
      <RecurringPaymentProvider>
        <Layout>
          <Dashboard />
        </Layout>
      </RecurringPaymentProvider>
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