const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const smsService = {
  sendOtp: async (mobileNumber: string) => {
    const response = await fetch(`${API_BASE_URL}/sms/send-otp.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile_number: mobileNumber }),
    });
    
    if (!response.ok) throw new Error('Failed to send OTP');
    return await response.json();
  },
};
