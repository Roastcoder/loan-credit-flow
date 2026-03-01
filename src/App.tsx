import { useCallback, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RoleProvider, useRole } from "@/contexts/RoleContext";
import SplashScreen from "@/components/SplashScreen";
import Index from "./pages/Index";
import CreditCards from "./pages/CreditCards";
import CardDetail from "./pages/CardDetail";
import LoanDisbursementPage from "./pages/LoanDisbursement";
import LoanDetail from "./pages/LoanDetail";
import NewLoanApplication from "./pages/NewLoanApplication";
import CarLoan from "./pages/CarLoan";
import HomeLoan from "./pages/HomeLoan";
import TeamApplications from "./pages/TeamApplication";
import LeadsPage from "./pages/Leads";
import Payouts from "./pages/Payouts";
import Team from "./pages/Team";
import Teams from "./pages/Team";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Permissions from "./pages/Permissions";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn, authLoading } = useRole();
  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-accent font-display text-xl">Loading...</div>
    </div>
  );
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

const AppRoutes = () => {
  const { isLoggedIn, hasSeenOnboarding, moduleAccess } = useRole();

  if (!hasSeenOnboarding) {
    return <Routes><Route path="*" element={<Onboarding />} /></Routes>;
  }

  return (
    <Routes>
      <Route path="/login" element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
      {moduleAccess.creditCards && (
        <>
          <Route path="/credit-cards" element={<ProtectedRoute><CreditCards /></ProtectedRoute>} />
          <Route path="/credit-cards/:id" element={<ProtectedRoute><CardDetail /></ProtectedRoute>} />
        </>
      )}
      {moduleAccess.loanDisbursement && (
        <>
          <Route path="/loan-disbursement" element={<ProtectedRoute><LoanDisbursementPage /></ProtectedRoute>} />
          <Route path="/loan-disbursement/new" element={<ProtectedRoute><NewLoanApplication /></ProtectedRoute>} />
          <Route path="/loan-disbursement/:id" element={<ProtectedRoute><LoanDetail /></ProtectedRoute>} />
          <Route path="/car-loan" element={<ProtectedRoute><CarLoan /></ProtectedRoute>} />
          <Route path="/home-loan" element={<ProtectedRoute><HomeLoan /></ProtectedRoute>} />
        </>
      )}
      <Route path="/team-applications" element={<ProtectedRoute><TeamApplications /></ProtectedRoute>} />
      <Route path="/payouts" element={<ProtectedRoute><Payouts /></ProtectedRoute>} />
      <Route path="/leads" element={<ProtectedRoute><LeadsPage /></ProtectedRoute>} />
      <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
      <Route path="/teams" element={<ProtectedRoute><Teams /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="/permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const AppInner = () => {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashDone = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <RoleProvider>
        <Toaster />
        <Sonner />
        <AppInner />
      </RoleProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
