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
  annualFee: number;
  joiningFee: number;
  dsaCommission: number;
  rewardPoints: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export type LoanCategory = 'car_loan' | 'used_car_loan' | 'personal_loan' | 'business_loan' | 'home_loan' | 'other';

export const LOAN_CATEGORY_LABELS: Record<LoanCategory, string> = {
  car_loan: 'Car Loan',
  used_car_loan: 'Used Car Loan',
  personal_loan: 'Personal Loan',
  business_loan: 'Business Loan',
  home_loan: 'Home Loan',
  other: 'Other',
};

export interface LoanDisbursement {
  id: string;
  applicantName: string;
  mobileNumber: string;
  category: LoanCategory;
  lenderName: string;
  caseType: string;
  oldHP: string;
  newHP: string;
  amount: number;
  interestRate: number;
  tenure: number;
  days: number;
  pddStatus: 'Pending' | 'Completed' | 'N/A';
  bankName: string;
  status: 'pending' | 'approved' | 'disbursed' | 'rejected';
  employeeName: string;
  managerName: string;
  dsaPartner: string;
  whoWeAre: 'DSA' | 'Finonest Employee' | 'Connector';
  disbursementDate: string;
  createdAt: string;
}

export interface Permission {
  view: boolean;
  edit: boolean;
  add: boolean;
  delete: boolean;
}

export const DEFAULT_PERMISSIONS: Record<UserRole, { creditCards: Permission; loanDisbursement: Permission }> = {
  super_admin: {
    creditCards: { view: true, edit: true, add: true, delete: true },
    loanDisbursement: { view: true, edit: true, add: true, delete: true },
  },
  admin: {
    creditCards: { view: true, edit: true, add: true, delete: false },
    loanDisbursement: { view: true, edit: true, add: true, delete: false },
  },
  manager: {
    creditCards: { view: true, edit: false, add: false, delete: false },
    loanDisbursement: { view: true, edit: true, add: false, delete: false },
  },
  team_leader: {
    creditCards: { view: true, edit: false, add: false, delete: false },
    loanDisbursement: { view: true, edit: true, add: false, delete: false },
  },
  employee: {
    creditCards: { view: true, edit: false, add: false, delete: false },
    loanDisbursement: { view: true, edit: true, add: false, delete: false },
  },
  dsa_partner: {
    creditCards: { view: true, edit: false, add: false, delete: false },
    loanDisbursement: { view: true, edit: false, add: false, delete: false },
  },
};
