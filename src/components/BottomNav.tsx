import { useState } from 'react';
import { LayoutDashboard, CreditCard, Target, Users, Plus, Wallet, Menu, UserCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useRole } from '@/contexts/RoleContext';

const BottomNav = () => {
  const { role, moduleAccess } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const mainNavItems = [
    { path: '/', label: 'Home', icon: LayoutDashboard },
    ...(moduleAccess.creditCards ? [{ path: '/leads', label: 'Leads', icon: Target }] : []),
  ];

  const rightNavItems = [
    { path: '/payouts', label: 'Payouts', icon: Wallet },
  ];

  const menuItems = [
    { path: '/credit-cards', label: 'Cards', icon: CreditCard, show: moduleAccess.creditCards },
    { path: '/permissions', label: 'Access', icon: Users, show: role === 'super_admin' || role === 'admin' },
    { path: '/profile', label: 'Profile', icon: UserCircle, show: true },
  ].filter(item => item.show);

  const renderNavItem = (item: { path: string; label: string; icon: React.ElementType }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 transition-colors ${
          isActive ? 'text-accent' : 'text-muted-foreground'
        }`}
      >
        <item.icon className={`w-5 h-5 ${isActive ? 'text-accent' : ''}`} />
        <span className="text-[10px] font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <>
      {showMenu && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
          onClick={() => setShowMenu(false)}
        />
      )}

      {showMenu && (
        <div className="md:hidden fixed bottom-[76px] left-4 right-4 z-50 bg-card border border-border rounded-2xl shadow-elevated overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="p-4 pb-3 border-b border-border">
            <p className="text-xs font-semibold text-foreground">Menu</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">All options</p>
          </div>
          <div className="p-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setShowMenu(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl hover:bg-muted/60 transition-colors ${
                    isActive ? 'bg-accent/10 text-accent' : 'text-card-foreground'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border">
        <div className="flex items-center py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {mainNavItems.map(renderNavItem)}

          {moduleAccess.creditCards && (
            <div className="flex flex-col items-center flex-1">
              <button
                onClick={() => navigate('/credit-cards')}
                className="-mt-5 relative"
              >
                <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center shadow-lg border-4 border-card">
                  <Plus className="w-6 h-6 text-accent-foreground" />
                </div>
              </button>
            </div>
          )}

          {rightNavItems.map(renderNavItem)}

          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`flex flex-col items-center gap-0.5 flex-1 py-1.5 transition-colors ${
              showMenu ? 'text-accent' : 'text-muted-foreground'
            }`}
          >
            <Menu className={`w-5 h-5 ${showMenu ? 'text-accent' : ''}`} />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
