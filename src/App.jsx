// LabTrack Pro — FCI computer lab management
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from '@/components/ProtectedRoute';
import SignInRequired from '@/components/common/SignInRequired';
import AppShell from '@/components/layout/AppShell';
import Overview from './pages/Overview';
import Labs from './pages/Labs';
import LabLayout from './pages/LabLayout';
import History from './pages/History';
import Notifications from './pages/Notifications';
import Inbox from '@/pages/Inbox';
import SignInLogs from './pages/SignInLogs';
import EditLabs from './pages/EditLabs';
import About from './pages/About';
import LabPulse from './pages/LabPulse';
import Reports from './pages/Reports';
import Account from './pages/Account';
import SignIn from './pages/SignIn';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-border border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
  }

  // Render the main app
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Overview />} />
        <Route path="/labs" element={<Labs />} />
        <Route path="/layout" element={<LabLayout />} />
        <Route path="/layout/:labId" element={<LabLayout />} />
        <Route path="/about" element={<About />} />
        <Route path="/history" element={<History />} />
        <Route path="/pulse" element={<LabPulse />} />
        <Route path="/signin-logs" element={<SignInLogs />} />
        <Route element={<ProtectedRoute unauthenticatedElement={<SignInRequired />} />}>
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/edit" element={<EditLabs />} />
          <Route path="/account" element={<Account />} />
        </Route>
      </Route>
      <Route path="/signin" element={<SignIn />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <ScrollToTop />
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App