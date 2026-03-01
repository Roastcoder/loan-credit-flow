const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const rcService = {
  verifyRC: async (rcNumber: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_BASE_URL}/api/rc/verify.php`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rc_number: rcNumber }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        return {
          success: true,
          data: data.data,
        };
      } else {
        throw new Error(data.message || 'RC verification failed');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Failed to verify RC');
    }
  },
};
