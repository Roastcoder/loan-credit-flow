import { useEffect, useState } from 'react';
import type { UserRole } from '@/types';

const mapEmployeeTypeToRole = (employeeType: string): UserRole => {
  const mapping: Record<string, UserRole> = {
    'SUPER_ADMIN': 'super_admin',
    'ADMIN': 'admin',
    'MANAGER': 'manager',
    'DSA': 'dsa_partner',
    'EMPLOYEE': 'employee',
    'TL': 'team_leader',
  };
  return mapping[employeeType] || 'employee';
};

export const useAuth = () => {
  const [user, setUser] = useState<any | null>(null);
  const [userRole, setUserRole] = useState<UserRole>('employee');
  const [loading, setLoading] = useState(false);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setDisplayName(userData.name || '');
      setUserRole(userData.role || 'employee');
    }
  }, []);

  const signUp = async (email: string, password: string, name: string, teamNumber?: string, employeeType?: string, channelCode?: string, pan?: string, dob?: string, aadhaar?: string, aadhaarName?: string, aadhaarAddress?: string, aadhaarFatherName?: string, userEmail?: string) => {
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    return { error: null };
  };

  const signOut = async () => {
    setUser(null);
    setUserRole('employee');
  };

  const resetPassword = async (email: string) => {
    return { error: null };
  };

  return { user, userRole, loading, displayName, signUp, signIn, signOut, resetPassword };
};
