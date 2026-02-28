import React, { createContext, useContext, useState } from 'react';
import { UserRole, Permission } from '@/types';
import { useAuth } from '@/hooks/useAuth';

type RolePermissions = Record<UserRole, { creditCards: Permission; loanDisbursement: Permission }>;

interface ModuleAccess { creditCards: boolean; loanDisbursement: boolean; }
interface UserAccess { [userId: string]: ModuleAccess; }

interface RoleContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  permissions: { creditCards: Permission; loanDisbursement: Permission };
  isLoggedIn: boolean;
  setIsLoggedIn: (v: boolean) => void;
  userAccess: UserAccess;
  setUserAccess: React.Dispatch<React.SetStateAction<UserAccess>>;
  rolePermissions: RolePermissions;
  setRolePermissions: React.Dispatch<React.SetStateAction<RolePermissions>>;
  hasSeenOnboarding: boolean;
  setHasSeenOnboarding: (v: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  // Auth
  authUser: ReturnType<typeof useAuth>['user'];
  authLoading: boolean;
  displayName: string;
  signUp: ReturnType<typeof useAuth>['signUp'];
  signIn: ReturnType<typeof useAuth>['signIn'];
  signOut: ReturnType<typeof useAuth>['signOut'];
  resetPassword: ReturnType<typeof useAuth>['resetPassword'];
  isDemoMode: boolean;
  setIsDemoMode: (v: boolean) => void;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

const defaultRolePermissions: RolePermissions = {
  super_admin: { creditCards: { view: true, edit: true, add: true, delete: true }, loanDisbursement: { view: true, edit: true, add: true, delete: true } },
  admin: { creditCards: { view: true, edit: true, add: true, delete: false }, loanDisbursement: { view: true, edit: true, add: true, delete: false } },
  manager: { creditCards: { view: true, edit: false, add: false, delete: false }, loanDisbursement: { view: true, edit: true, add: false, delete: false } },
  team_leader: { creditCards: { view: true, edit: false, add: false, delete: false }, loanDisbursement: { view: true, edit: true, add: false, delete: false } },
  employee: { creditCards: { view: true, edit: false, add: false, delete: false }, loanDisbursement: { view: true, edit: true, add: false, delete: false } },
  dsa_partner: { creditCards: { view: true, edit: false, add: false, delete: false }, loanDisbursement: { view: true, edit: false, add: false, delete: false } },
};

const defaultUserAccess: UserAccess = {
  'user-1': { creditCards: true, loanDisbursement: true },
  'user-2': { creditCards: true, loanDisbursement: false },
  'user-3': { creditCards: false, loanDisbursement: true },
  'user-4': { creditCards: true, loanDisbursement: true },
  'user-5': { creditCards: false, loanDisbursement: false },
};

export const RoleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  const [demoRole, setDemoRole] = useState<UserRole>('super_admin');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('auth_token'));
  const [userAccess, setUserAccess] = useState<UserAccess>(defaultUserAccess);
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>(defaultRolePermissions);
  const [hasSeenOnboarding, setHasSeenOnboardingState] = useState(() => localStorage.getItem('fincore_onboarding') === 'done');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleOnboarding = (v: boolean) => {
    setHasSeenOnboardingState(v);
    if (v) localStorage.setItem('fincore_onboarding', 'done');
  };

  const effectiveRole = isDemoMode ? demoRole : auth.userRole;
  const effectiveLoggedIn = isLoggedIn || !!auth.user;

  return (
    <RoleContext.Provider value={{
      role: effectiveRole,
      setRole: setDemoRole,
      permissions: rolePermissions[effectiveRole],
      isLoggedIn: effectiveLoggedIn,
      setIsLoggedIn,
      userAccess, setUserAccess,
      rolePermissions, setRolePermissions,
      hasSeenOnboarding, setHasSeenOnboarding: handleOnboarding,
      sidebarOpen, setSidebarOpen,
      authUser: auth.user,
      authLoading: auth.loading,
      displayName: isDemoMode ? 'Demo User' : auth.displayName,
      signUp: auth.signUp,
      signIn: auth.signIn,
      signOut: auth.signOut,
      resetPassword: auth.resetPassword,
      isDemoMode, setIsDemoMode,
    }}>
      {children}
    </RoleContext.Provider>
  );
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) throw new Error('useRole must be used within RoleProvider');
  return context;
};

export const DEMO_USERS = [
  { id: 'user-1', name: 'Rajesh Kumar', email: 'rajesh@fincore.com', role: 'admin' as UserRole },
  { id: 'user-2', name: 'Priya Singh', email: 'priya@fincore.com', role: 'manager' as UserRole },
  { id: 'user-3', name: 'Amit Patel', email: 'amit@fincore.com', role: 'team_leader' as UserRole },
  { id: 'user-4', name: 'Sneha Reddy', email: 'sneha@fincore.com', role: 'employee' as UserRole },
  { id: 'user-5', name: 'Vikram DSA', email: 'vikram@dsa.com', role: 'dsa_partner' as UserRole },
];
