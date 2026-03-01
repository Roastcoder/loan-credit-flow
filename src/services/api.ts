const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const api = {
  // Credit Cards
  getCreditCards: async () => {
    const response = await fetch(`${API_BASE_URL}/api/credit-cards/read.php`);
    return response.json();
  },

  createCreditCard: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/credit-cards/create.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Loan Disbursements
  getLoanDisbursements: async () => {
    const response = await fetch(`${API_BASE_URL}/api/loans/read.php`);
    return response.json();
  },

  createLoanDisbursement: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/loans/create.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // Leads
  getLeads: async () => {
    const response = await fetch(`${API_BASE_URL}/api/leads/read.php`);
    return response.json();
  },

  createLead: async (data: any) => {
    const response = await fetch(`${API_BASE_URL}/api/leads/create.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  // PAN Verification
  verifyPAN: async (panNumber: string) => {
    const response = await fetch(`${API_BASE_URL}/api/pan/verify.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_number: panNumber }),
    });
    return response.json();
  },
};
