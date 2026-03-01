const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
const SUREPASS_TOKEN = import.meta.env.VITE_SUREPASS_TOKEN || '';

export const panService = {
  verifyPan: async (panNumber: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/pan/verify.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_number: panNumber }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Raw API response:', data);
      return data;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  },
};
