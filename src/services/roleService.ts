const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

export const roleService = {
  async getUserRole(mobile: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/get-role.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to get role');
    return data;
  },

  async updateUserRole(mobile: string, role: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/update-role.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, role }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to update role');
    return data;
  },

  async listUsers() {
    const response = await fetch(`${API_BASE_URL}/api/auth/list-users.php`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to list users');
    return data;
  },

  async updateUserRoleById(userId: number, role: string) {
    const response = await fetch(`${API_BASE_URL}/api/permissions/update-role.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, role }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.error || 'Failed to update role');
    return data;
  },
};
