import { CreditCard, FileText, Users, TrendingUp, Target, DollarSign, UserCheck, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import AppLayout from '@/components/AppLayout';
import StatCard from '@/components/StatCard';
import { useRole } from '@/contexts/RoleContext';
import { ROLE_LABELS, LOAN_CATEGORY_LABELS } from '@/types';
import { mockDisbursements } from '@/data/mockData';
import { api } from '@/services/api';

const CHART_COLORS = [
  'hsl(168, 60%, 42%)', 'hsl(205, 80%, 50%)', 'hsl(38, 92%, 50%)',
  'hsl(0, 72%, 51%)', 'hsl(152, 60%, 42%)', 'hsl(270, 50%, 50%)',
];

const monthlyData = [
  { month: 'Jan', carLoan: 0, personalLoan: 0, homeLoan: 0, businessLoan: 0, amount: 0 },
  { month: 'Feb', carLoan: 0, personalLoan: 0, homeLoan: 0, businessLoan: 0, amount: 0 },
  { month: 'Mar', carLoan: 0, personalLoan: 0, homeLoan: 0, businessLoan: 0, amount: 0 },
  { month: 'Apr', carLoan: 0, personalLoan: 0, homeLoan: 0, businessLoan: 0, amount: 0 },
  { month: 'May', carLoan: 0, personalLoan: 0, homeLoan: 0, businessLoan: 0, amount: 0 },
  { month: 'Jun', carLoan: 0, personalLoan: 0, homeLoan: 0, businessLoan: 0, amount: 0 },
];

const Index = () => {
  const { role, displayName, moduleAccess } = useRole();
  const navigate = useNavigate();
  const [creditCards, setCreditCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
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
  const totalDisbursed = mockDisbursements.filter(d => d.status === 'disbursed').reduce((sum, d) => sum + d.amount, 0);
  const pendingLoans = mockDisbursements.filter(d => d.status === 'pending').length;
  const totalCommission = creditCards.reduce((sum, c) => sum + (c.dsa_commission || c.dsaCommission || 0), 0);

  const categoryData = Object.entries(LOAN_CATEGORY_LABELS).map(([key, label]) => {
    const count = mockDisbursements.filter(d => d.category === key).length;
    return { name: label, value: count || 1 };
  });

  const cardPerformance = creditCards.map(c => ({
    name: c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name,
    commission: c.dsa_commission || c.dsaCommission || 0,
    annualFee: c.annual_fee || c.annualFee || 0,
  }));

  // Role-specific dashboard content
  const renderRoleDashboard = () => {
    if (role === 'super_admin' || role === 'admin') {
      return (
        <>
          {/* Admin Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div onClick={() => navigate('/credit-cards')} className="cursor-pointer active:scale-95 transition-transform">
              <StatCard title="Active Cards" value={activeCreditCards} subtitle="Products" icon={CreditCard} trend="up" trendValue="+2" />
            </div>
            <div onClick={() => navigate('/loan-disbursement')} className="cursor-pointer active:scale-95 transition-transform">
              <StatCard title="Disbursed" value={`₹${(totalDisbursed / 100000).toFixed(1)}L`} subtitle="Total" icon={TrendingUp} trend="up" trendValue="+15%" />
            </div>
            <div onClick={() => navigate('/leads')} className="cursor-pointer active:scale-95 transition-transform">
              <StatCard title="Total Leads" value="0" subtitle="This month" icon={Target} trend="up" trendValue="+0" />
            </div>
            <div onClick={() => navigate('/team')} className="cursor-pointer active:scale-95 transition-transform">
              <StatCard title="Team Members" value="0" subtitle="Active" icon={Users} />
            </div>
          </div>

          {/* Quick Actions */}
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
            {moduleAccess.loanDisbursement && (
              <button onClick={() => navigate('/loan-disbursement')} className="bg-card rounded-xl p-3 border border-border shadow-card hover:border-accent/30 transition-all text-left">
                <FileText className="w-4 h-4 text-warning mb-1.5" />
                <p className="text-xs font-semibold text-card-foreground">Disbursements</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{pendingLoans} pending</p>
              </button>
            )}
            <button onClick={() => navigate('/permissions')} className="bg-card rounded-xl p-3 border border-border shadow-card hover:border-accent/30 transition-all text-left">
              <Users className="w-4 h-4 text-destructive mb-1.5" />
              <p className="text-xs font-semibold text-card-foreground">Permissions</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Manage access</p>
            </button>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-card rounded-xl p-3 md:p-4 shadow-card border border-border">
              <h2 className="text-sm md:text-base font-display font-semibold text-card-foreground mb-3">Disbursement Trends</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <defs><linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(168, 60%, 42%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(168, 60%, 42%)" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 10%, 46%)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 10%, 46%)" />
                    <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(214, 20%, 90%)', borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="amount" stroke="hsl(168, 60%, 42%)" fillOpacity={1} fill="url(#colorAmount)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-card rounded-xl p-3 md:p-4 shadow-card border border-border">
              <h2 className="text-sm md:text-base font-display font-semibold text-card-foreground mb-3">Loan Category Split</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                      {categoryData.map((_, idx) => <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(214, 20%, 90%)', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {categoryData.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />{c.name}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Charts */}
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
              <h2 className="text-sm md:text-base font-display font-semibold text-card-foreground mb-3">Monthly Loan Breakdown</h2>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 10%, 46%)" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 10%, 46%)" />
                    <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(214, 20%, 90%)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="carLoan" stackId="a" fill={CHART_COLORS[0]} name="Car Loan" />
                    <Bar dataKey="personalLoan" stackId="a" fill={CHART_COLORS[1]} name="Personal" />
                    <Bar dataKey="homeLoan" stackId="a" fill={CHART_COLORS[2]} name="Home" />
                    <Bar dataKey="businessLoan" stackId="a" fill={CHART_COLORS[3]} name="Business" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
            {moduleAccess.loanDisbursement && (
              <button onClick={() => navigate('/loan-disbursement')} className="bg-card rounded-xl p-3 border border-border shadow-card hover:border-accent/30 transition-all text-left">
                <FileText className="w-4 h-4 text-warning mb-1.5" />
                <p className="text-xs font-semibold text-card-foreground">Disbursements</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">Track status</p>
              </button>
            )}
          </div>

          <div className="bg-card rounded-xl p-3 md:p-4 shadow-card border border-border">
            <h2 className="text-sm md:text-base font-display font-semibold text-card-foreground mb-3">My Performance</h2>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs><linearGradient id="colorAmountEmp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="hsl(168, 60%, 42%)" stopOpacity={0.3} /><stop offset="95%" stopColor="hsl(168, 60%, 42%)" stopOpacity={0} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(215, 10%, 46%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(215, 10%, 46%)" />
                  <Tooltip contentStyle={{ background: 'hsl(0, 0%, 100%)', border: '1px solid hsl(214, 20%, 90%)', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="amount" stroke="hsl(168, 60%, 42%)" fillOpacity={1} fill="url(#colorAmountEmp)" strokeWidth={2} />
                </AreaChart>
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
    </AppLayout>
  );
};

export default Index;
