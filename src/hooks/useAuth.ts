import { useEffect, useState } from 'react';
import type { UserRole } from '@/types';

const mapEmployeeTypeToRole = (employeeType: string): UserRole => {
  const mapping: Record<string, UserRole> = {
    'ADMIN': 'super_admin',
    'DSA': 'dsa_partner',
    'DST': 'employee',
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
      
      // Fetch full profile to get employee_type
      const fetchProfile = async () => {
        try {
          const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
          const response = await fetch(`${API_BASE_URL}/api/auth/profile.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mobile: userData.mobile }),
          });
          const data = await response.json();
          if (data.success && data.user) {
            setUserRole(mapEmployeeTypeToRole(data.user.employee_type));
          }
        } catch (error) {
          console.error('Failed to fetch profile:', error);
        }
      };
      fetchProfile();
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
