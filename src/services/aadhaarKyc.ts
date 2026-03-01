const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const aadhaarKycService = {
  sendOtp: async (aadhaarNumber: string) => {
    const response = await fetch(`${API_BASE_URL}/api/aadhaar/send-otp.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aadhaar_number: aadhaarNumber }),
    });
    
    if (!response.ok) throw new Error('Failed to send OTP');
    const data = await response.json();
    
    return {
      success: data.success,
      request_id: data.data?.sessionId,
      message: data.message,
    };
  },

  verifyOtp: async (aadhaarNumber: string, otp: string, requestId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/aadhaar/verify-otp.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: requestId, otp }),
    });
    
    if (!response.ok) throw new Error('Failed to verify OTP');
    const data = await response.json();
    
    const details = data.data || {};
    const fullAddress = `${details.house || ''} ${details.street || ''} ${details.locality || ''}, ${details.subDistrict || ''}, ${details.district || ''}, ${details.state || ''} - ${details.pincode || ''}`.trim();
    
    return {
      success: data.success,
      name: details.name,
      address: fullAddress,
      father_name: details.careof,
      aadhaar_number: aadhaarNumber,
    };
  },

  getDetails: async (aadhaarNumber: string, requestId: string) => {
    return { 
      name: 'DEMO USER',
      address: 'Demo Address, City, State',
      father_name: 'DEMO FATHER',
    };
  },
};
