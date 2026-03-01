import AppSidebar from './AppSidebar';
import BottomNav from './BottomNav';
import Footer from './Footer';
import NotificationBell from './NotificationBell';
import { useRole } from '@/contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserCircle } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { useEffect, useState } from 'react';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, isDemoMode, setIsLoggedIn, displayName } = useRole();
  const navigate = useNavigate();
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
        const response = await fetch(`${API_BASE_URL}/api/auth/profile.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mobile: user.mobile }),
        });
        const data = await response.json();
        if (data.success && data.user?.aadhaar_photo) {
          setProfilePhoto(`data:image/jpeg;base64,${data.user.aadhaar_photo}`);
        }
      } catch (error) {
        console.error('Failed to fetch profile photo:', error);
      }
    };
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('hasSeenOnboarding');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <SidebarProvider>
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-24 h-8">
              <img src="/finonest-logo.png" alt="Finonest" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <NotificationBell />
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-muted transition-colors">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AppSidebar />
      </div>

      {/* Main Content */}
      <SidebarInset>
        {/* Desktop top bar */}
        <div className="hidden md:flex items-center justify-between px-6 py-2.5 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <button onClick={() => navigate('/profile')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
              {profilePhoto ? (
                <img src={profilePhoto} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full gradient-accent flex items-center justify-center">
                  <UserCircle className="w-5 h-5 text-accent-foreground" />
                </div>
              )}
              <span className="text-sm font-medium text-foreground">{displayName}</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="pt-[60px] md:pt-0">
          <div className="p-4 pb-24 md:pb-6 md:p-6 lg:p-8">{children}</div>
        </div>

        {/* Desktop Footer */}
        <div className="hidden md:block mt-auto"><Footer /></div>
      </SidebarInset>

      {/* Mobile Bottom Nav */}
      <BottomNav />
    </SidebarProvider>
  );
};

export default AppLayout;
