const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const api = {
  // Credit Cards
  getCreditCards: async () => {
    const response = await fetch(`${API_BASE_URL}/credit-cards/read.php`);
    return response.json();
  },

  createCreditCard: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/credit-cards/create.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Loan Disbursements
  getLoanDisbursements: async () => {
    const response = await fetch(`${API_BASE_URL}/loans/read.php`);
    return response.json();
  },

  createLoanDisbursement: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/loans/create.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Leads
  getLeads: async () => {
    const response = await fetch(`${API_BASE_URL}/leads/read.php`);
    return response.json();
  },

  createLead: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/leads/create.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // PAN Verification
  verifyPAN: async (panNumber: string) => {
    const response = await fetch(`${API_BASE_URL}/pan/verify.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_number: panNumber }),
    });
    return response.json();
  },
};
