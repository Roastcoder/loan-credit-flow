export type UserRole = 'super_admin' | 'admin' | 'manager' | 'team_leader' | 'employee' | 'dsa_partner';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  manager: 'Manager',
  team_leader: 'Team Leader',
  employee: 'Employee',
  dsa_partner: 'DSA Partner',
};

export interface CreditCardProduct {
  id: string;
  name: string;
  bank: string;
  type: string;
  annual_fee?: number;
  annualFee?: number;
  joining_fee?: number;
  joiningFee?: number;
  dsa_commission?: number;
  dsaCommission?: number;
  reward_points?: string;
  rewardPoints?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  createdAt?: string;
}

export interface Permission {
  view: boolean;
  edit: boolean;
  add: boolean;
  delete: boolean;
}

export const DEFAULT_PERMISSIONS: Record<UserRole, { creditCards: Permission }> = {
  super_admin: {
    creditCards: { view: true, edit: true, add: true, delete: true },
  },
  admin: {
    creditCards: { view: true, edit: true, add: true, delete: false },
  },
  manager: {
    creditCards: { view: true, edit: false, add: false, delete: false },
  },
  team_leader: {
    creditCards: { view: true, edit: false, add: false, delete: false },
  },
  employee: {
    creditCards: { view: true, edit: false, add: false, delete: false },
  },
  dsa_partner: {
    creditCards: { view: true, edit: false, add: false, delete: false },
  },
};
