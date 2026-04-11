import { CreditCard, Users, TrendingUp, Target, DollarSign, UserCheck, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import StatCard from '@/components/StatCard';
import { useRole } from '@/contexts/RoleContext';
import { ROLE_LABELS } from '@/types';
import { api } from '@/services/api';

const Index = () => {
  const { role, displayName, moduleAccess } = useRole();
  const navigate = useNavigate();
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const data = await api.getCreditCards();
      setCreditCards(data.records || []);
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeCreditCards = creditCards.length;
  const totalCommission = creditCards.reduce((sum, c) => sum + (c.dsa_commission || c.dsaCommission || 0), 0);

  const cardPerformance = creditCards.map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name,
    commission: c.dsa_commission || c.dsaCommission || 0,
    annualFee: c.annual_fee || c.annualFee || 0,
  }));

  const renderRoleDashboard = () => {
    if (role === 'super_admin' || role === 'admin') {
      return (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div onClick={() => navigate('/credit-cards')} className="cursor-pointer active:scale-95 transition-transform">
              <StatCard title="Active Cards" value={activeCreditCards} subtitle="Products" icon={CreditCard} trend="up" trendValue="+2" />
            </div>
            <div onClick={() => navigate('/leads')} className="cursor-pointer active:scale-95 transition-transform">
              <StatCard title="Total Leads" value="0" subtitle="This month" icon={Target} trend="up" trendValue="+0" />
            </div>
            <div onClick={() => navigate('/payouts')} className="cursor-pointer active:scale-95 transition-transform">
              <StatCard title="Commission" value={`₹${totalCommission.toLocaleString()}`} subtitle="Total" icon={TrendingUp} trend="up" trendValue="+15%" />
            </div>
            <div onClick={() => navigate('/team')} className="cursor-pointer active:scale-95 transition-transform">
              <StatCard title="Team Members" value="0" subtitle="Active" icon={Users} />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button onClick={() => navigate('/leads')} className="bg-card rounded-xl p-3 border border-border shadow-card hover:border-accent/30 transition-all text-left">
              <Target className="w-4 h-4 text-accent mb-1.5" />
              <p className="text-xs font-semibold text-card-foreground">Manage Leads</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">0 active leads</p>
            </button>
            {moduleAccess.creditCards && (
              <button onClick={() => navigate('/credit-cards')} className="bg-card rounded-xl p-3 border border-border shadow-card hover:border-accent/30 transition-all text-left">
                <CreditCard className="w-4 h-4 text-info mb-1.5" />
                <p className="text-xs font-semibold text-card-foreground">Card Products</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{activeCreditCards} active</p>
              </button>
            )}
            <button onClick={() => navigate('/permissions')} className="bg-card rounded-xl p-3 border border-border shadow-card hover:border-accent/30 transition-all text-left">
              <Users className="w-4 h-4 text-destructive mb-1.5" />
              <p className="text-xs font-semibold text-card-foreground">Permissions</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Manage access</p>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-3 md:p-4 shadow-card border border-border">
              <h2 className="text-sm md:text-base font-display font-semibold text-card-foreground mb-3">Credit Card Performance</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cardPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="hsl(215, 10%, 46%)" />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215, 10%, 46%)" width={90} />
                    <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(214, 20%, 90%)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="commission" fill="hsl(168, 60%, 42%)" radius={[0, 4, 4, 0]} name="Commission ₹" />
                    <Bar dataKey="annualFee" fill="hsl(205, 80%, 50%)" radius={[0, 4, 4, 0]} name="Annual Fee ₹" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-card rounded-xl p-3 md:p-4 shadow-card border border-border">
              <h2 className="text-sm md:text-base font-display font-semibold text-card-foreground mb-3">Top Cards by Commission</h2>
              <div className="space-y-2">
                {creditCards.filter(c => c.status === 'active').sort((a, b) => (b.dsa_commission || b.dsaCommission || 0) - (a.dsa_commission || a.dsaCommission || 0)).map(c => (
                  <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-xs text-card-foreground truncate">{c.name}</p>
                      <p className="text-[10px] text-muted-foreground">{c.bank}</p>
                    </div>
                    <p className="font-bold text-accent text-xs">₹{(c.dsa_commission || c.dsaCommission || 0).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      );
    }

    if (role === 'employee' || role === 'team_leader' || role === 'manager') {
      return (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {role === 'manager' && (
              <button onClick={() => navigate('/team')} className="bg-card rounded-xl p-3 border border-border shadow-card hover:border-accent/30 transition-all text-left">
                <Users className="w-4 h-4 text-accent mb-1.5" />
                <p className="text-xs font-semibold text-card-foreground">My Team</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">8 members</p>
              </button>
            )}
            {moduleAccess.creditCards && (
              <button onClick={() => navigate('/credit-cards')} className="bg-card rounded-xl p-3 border border-border shadow-card hover:border-accent/30 transition-all text-left">
                <CreditCard className="w-4 h-4 text-accent mb-1.5" />
                <p className="text-xs font-semibold text-card-foreground">Apply for Card</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{activeCreditCards} cards available</p>
              </button>
            )}
            <button onClick={() => navigate('/leads')} className="bg-card rounded-xl p-3 border border-border shadow-card hover:border-accent/30 transition-all text-left">
              <Target className="w-4 h-4 text-info mb-1.5" />
              <p className="text-xs font-semibold text-card-foreground">My Leads</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">8 active leads</p>
            </button>
          </div>

          <div className="bg-card rounded-xl p-3 md:p-4 shadow-card border border-border">
            <h2 className="text-sm md:text-base font-display font-semibold text-card-foreground mb-3">Credit Card Performance</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cardPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215, 10%, 46%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 10%, 46%)" />
                  <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(214, 20%, 90%)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="commission" fill="hsl(168, 60%, 42%)" radius={[4, 4, 0, 0]} name="Commission ₹" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      );
    }

    // DSA Partner Dashboard
    return (
      <>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div onClick={() => navigate('/leads')} className="cursor-pointer active:scale-95 transition-transform">
            <StatCard title="My Referrals" value="0" subtitle="Total" icon={Users} trend="up" trendValue="+0" />
          </div>
          <div onClick={() => navigate('/leads')} className="cursor-pointer active:scale-95 transition-transform">
            <StatCard title="Converted" value="0" subtitle="Leads" icon={UserCheck} trend="up" trendValue="+0" />
          </div>
          <div onClick={() => navigate('/payouts')} className="cursor-pointer active:scale-95 transition-transform">
            <StatCard title="Commission" value={`₹${totalCommission.toLocaleString()}`} subtitle="Earned" icon={DollarSign} trend="up" trendValue="+₹2,400" />
          </div>
          <div onClick={() => navigate('/credit-cards')} className="cursor-pointer active:scale-95 transition-transform">
            <StatCard title="Active Cards" value={activeCreditCards} subtitle="Products" icon={CreditCard} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {moduleAccess.creditCards && (
            <button onClick={() => navigate('/credit-cards')} className="bg-card rounded-xl p-3 border border-border shadow-card hover:border-accent/30 transition-all text-left">
              <Award className="w-4 h-4 text-accent mb-1.5" />
              <p className="text-xs font-semibold text-card-foreground">Refer a Card</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Earn commission</p>
            </button>
          )}
          <button onClick={() => navigate('/leads')} className="bg-card rounded-xl p-3 border border-border shadow-card hover:border-accent/30 transition-all text-left">
            <Target className="w-4 h-4 text-info mb-1.5" />
            <p className="text-xs font-semibold text-card-foreground">My Leads</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Track referrals</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-card rounded-xl p-3 md:p-4 shadow-card border border-border">
            <h2 className="text-sm md:text-base font-display font-semibold text-card-foreground mb-3">Commission Earned</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={cardPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(215, 10%, 46%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(215, 10%, 46%)" />
                  <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(214, 20%, 90%)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="commission" fill="hsl(168, 60%, 42%)" radius={[4, 4, 0, 0]} name="Commission ₹" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-card rounded-xl p-3 md:p-4 shadow-card border border-border">
            <h2 className="text-sm md:text-base font-display font-semibold text-card-foreground mb-3">Top Cards by Commission</h2>
            <div className="space-y-2">
              {creditCards.filter(c => c.status === 'active').sort((a, b) => (b.dsa_commission || b.dsaCommission || 0) - (a.dsa_commission || a.dsaCommission || 0)).map(c => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-xs text-card-foreground truncate">{c.name}</p>
                    <p className="text-[10px] text-muted-foreground">{c.bank}</p>
                  </div>
                  <p className="font-bold text-accent text-xs">₹{(c.dsa_commission || c.dsaCommission || 0).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <AppLayout>
      {loading ? (
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
      ) : (
        <div className="space-y-4 md:space-y-5">
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">
              Welcome back{displayName ? `, ${displayName}` : ''}
            </h1>
            <p className="text-muted-foreground mt-0.5 text-xs">
              Logged in as <span className="font-semibold text-accent">{ROLE_LABELS[role]}</span> · Here&apos;s your overview
            </p>
          </div>

          {renderRoleDashboard()}
        </div>
      )}
    </AppLayout>
  );
};

export default Index;
