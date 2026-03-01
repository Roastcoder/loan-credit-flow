const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const customAuth = {
  signUp: async (mobile: string, mpin: string, name: string, employeeType: string, channelCode: string, pan: string, dob: string, aadhaar: string, aadhaarName: string, aadhaarAddress: string, aadhaarFatherName: string, email: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mobile,
        mpin,
        name,
        employee_type: employeeType,
        channel_code: channelCode,
        pan,
        dob,
        aadhaar,
        aadhaar_name: aadhaarName,
        aadhaar_address: aadhaarAddress,
        aadhaar_father_name: aadhaarFatherName,
        email,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Signup failed');
    }
    
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return { success: data.success, error: null };
  },

  signIn: async (identifier: string, mpin: string) => {
    console.log('Signing in with:', identifier, mpin);
    const response = await fetch(`${API_BASE_URL}/api/auth/signin.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, mpin }),
    });
    
    console.log('Signin response:', response.status);
    
    if (!response.ok) {
      const error = await response.json();
      console.error('Signin error:', error);
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await response.json();
    console.log('Signin success:', data);
    localStorage.setItem('auth_token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return { success: data.success, error: null };
  },

  signOut: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  },

  getUser: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) return null;
    
    const response = await fetch(`${API_BASE_URL}/api/auth/user`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    
    if (!response.ok) return null;
    const data = await response.json();
    return data.user;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('auth_token');
  },
};
