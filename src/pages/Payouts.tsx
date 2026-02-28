import { useState } from 'react';
import { Search, Download, Filter, Calendar, CheckCircle2, Clock, XCircle } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Payouts = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const payouts = [
    {
      id: 1,
      user: { name: 'Kishan Bairwa', email: 'kishanbairwa30266@gmail.com', avatar: 'KB' },
      leadId: 'BWXSGW',
      customer: 'Uday Singh Choudhary',
      product: 'PIXEL CREDIT CARD',
      bank: 'HDFC Bank',
      commission: 3000,
      deduction: 1000,
      netPayout: 2000,
      payoutStatus: 'paid',
      payoutDate: '2024-01-15'
    },
    {
      id: 2,
      user: { name: 'Aslam Khan', email: 'akhan874@gmail.com', avatar: 'AK' },
      leadId: '0C4MX3',
      customer: 'Mohammad Saif ali',
      product: 'Classic Credit Card',
      bank: 'IDFC First Bank',
      commission: 1400,
      deduction: 0,
      netPayout: 1400,
      payoutStatus: 'pending',
      payoutDate: '-'
    },
    {
      id: 3,
      user: { name: 'Govardhan Kharol', email: 'jaidevkharol@gmail.com', avatar: 'GK' },
      leadId: '27AKQE',
      customer: 'Sanjay Sindhi',
      product: 'Easy Credit Card',
      bank: 'Bank Of Baroda',
      commission: 1100,
      deduction: 0,
      netPayout: 1100,
      payoutStatus: 'processing',
      payoutDate: '-'
    }
  ];

  const getStatusBadge = (status: string) => {
    const variants = {
      paid: { label: 'Paid', className: 'bg-success/10 text-success border-success/20' },
      pending: { label: 'Pending', className: 'bg-warning/10 text-warning border-warning/20' },
      processing: { label: 'Processing', className: 'bg-info/10 text-info border-info/20' },
      failed: { label: 'Failed', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    };
    const variant = variants[status as keyof typeof variants] || variants.pending;
    return <Badge variant="outline" className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Payouts</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Track commissions and manage payouts</p>
          </div>
          <Button className="gradient-accent text-accent-foreground border-0">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <Card className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name, email, or lead ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            {payouts.map((payout) => (
              <Card key={payout.id} className="p-4 hover:shadow-md transition-all border-l-4 border-l-accent">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-12 h-12 rounded-full gradient-accent flex items-center justify-center text-accent-foreground font-bold text-sm flex-shrink-0">
                      {payout.user.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{payout.user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{payout.user.email}</p>
                      <p className="text-xs font-mono text-accent mt-0.5">Lead: {payout.leadId}</p>
                    </div>
                  </div>

                  <div className="flex-1 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Customer</p>
                      <p className="font-medium truncate">{payout.customer}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Product</p>
                      <p className="font-medium truncate">{payout.product}</p>
                      <p className="text-xs text-muted-foreground truncate">{payout.bank}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 md:gap-6">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Commission</p>
                      <p className="font-bold text-foreground">₹{payout.commission.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Deduction</p>
                      <p className="font-bold text-destructive">-₹{payout.deduction.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Net Payout</p>
                      <p className="font-bold text-lg text-success">₹{payout.netPayout.toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(payout.payoutStatus)}
                      {payout.payoutDate !== '-' && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {payout.payoutDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Payouts;
