import AppSidebar from './AppSidebar';
import BottomNav from './BottomNav';
import Footer from './Footer';
import NotificationBell from './NotificationBell';
import { useRole } from '@/contexts/RoleContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const { signOut, isDemoMode, setIsLoggedIn, displayName } = useRole();
  const navigate = useNavigate();

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
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full gradient-accent flex items-center justify-center text-[10px] font-bold text-accent-foreground">
                {(displayName || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-sm font-medium text-foreground">{displayName}</span>
            </div>
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
