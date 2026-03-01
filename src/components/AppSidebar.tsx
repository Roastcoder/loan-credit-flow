import { CreditCard, LayoutDashboard, FileText, ChevronDown, Users, LogOut, Target, Plus, Car, Home, Briefcase, Wallet, UsersRound } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { ROLE_LABELS, UserRole } from '@/types';
import { useLocation, useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarRail, useSidebar,
} from '@/components/ui/sidebar';

const AppSidebar = () => {
  const { role, setRole, signOut, isDemoMode, setIsLoggedIn, displayName, moduleAccess } = useRole();
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    ...(moduleAccess.creditCards ? [{ path: '/credit-cards', label: 'Credit Cards', icon: CreditCard }] : []),
    ...(moduleAccess.loanDisbursement ? [{ path: '/loan-disbursement', label: 'Loan Disbursement', icon: FileText }] : []),
    { path: '/payouts', label: 'Payouts', icon: Wallet },
    ...(moduleAccess.creditCards ? [{ path: '/leads', label: 'Leads', icon: Target }] : []),
    ...((role === 'super_admin' || role === 'admin') ? [
      { path: '/teams', label: 'Teams', icon: UsersRound },
      { path: '/permissions', label: 'Permissions', icon: Users }
    ] : []),
  ];

  const roles: UserRole[] = ['super_admin', 'admin', 'manager', 'team_leader', 'employee', 'dsa_partner'];

  const handleLogout = async () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.removeItem('hasSeenOnboarding');
    setIsLoggedIn(false);
    window.location.href = '/login';
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-3">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-2'}`}>
          {collapsed ? (
            <div className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-accent-foreground font-display font-bold text-sm">F</span>
            </div>
          ) : (
            <div className="w-28 h-8">
              <img src="/finonest-logo.png" alt="Finonest" className="w-full h-full object-contain brightness-0 invert" />
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px]">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} size="sm">
                      <NavLink
                        to={item.path}
                        end={item.path === '/'}
                        className="gap-2 text-xs"
                        activeClassName="font-semibold"
                      >
                        <item.icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {moduleAccess.loanDisbursement && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-[10px]">Quick Actions</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="New & Used Car Loan Applications" size="sm">
                    <NavLink to="/car-loan" className="gap-2 text-xs">
                      <Car className="w-3.5 h-3.5" />
                      <span>Car Loan</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Home Loan and Loan Against Property Applications" size="sm">
                    <NavLink to="/home-loan" className="gap-2 text-xs">
                      <Home className="w-3.5 h-3.5" />
                      <span>Home Loan</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Personal and Business Loan Applications" size="sm">
                    <NavLink to="/pl-bl" className="gap-2 text-xs">
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>PL / BL</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Team Loan Applications" size="sm">
                    <NavLink to="/team-applications" className="gap-2 text-xs">
                      <Users className="w-3.5 h-3.5" />
                      <span>Team Applications</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-sidebar-border">
        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${collapsed ? 'justify-center p-1.5' : 'gap-2 px-2 py-1.5'} rounded-lg text-xs text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all`}
        >
          <LogOut className="w-3.5 h-3.5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};

export default AppSidebar;
