import { useState } from 'react';
import { Search, Filter, Download, Plus, ArrowRight, Eye, Pencil, Trash2, FileText as FileIcon, Phone, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import StatusBadge from '@/components/StatusBadge';
import { useRole } from '@/contexts/RoleContext';
import { mockDisbursements } from '@/data/mockData';
import type { LoanDisbursement as LoanDisbursementType, LoanCategory } from '@/types';
import { LOAN_CATEGORY_LABELS } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const LoanDisbursementPage = () => {
  const { role, permissions } = useRole();
  const navigate = useNavigate();
  const [disbursements, setDisbursements] = useState<LoanDisbursementType[]>(mockDisbursements);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLoan, setNewLoan] = useState({
    applicantName: '', category: 'personal_loan' as LoanCategory, amount: '',
    bankName: '', employeeName: '', dsaPartner: '',
  });

  const filtered = disbursements.filter(d => {
    const matchSearch = d.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      d.bankName.toLowerCase().includes(search.toLowerCase()) ||
      d.mobileNumber.includes(search);
    const matchCategory = categoryFilter === 'all' || d.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(d => d.id)));
    }
  };

  const handleAddLoan = () => {
    if (!newLoan.applicantName || !newLoan.amount || !newLoan.bankName) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }
    const loan: LoanDisbursementType = {
      id: String(disbursements.length + 1),
      applicantName: newLoan.applicantName,
      mobileNumber: '',
      category: newLoan.category,
      lenderName: newLoan.bankName,
      caseType: LOAN_CATEGORY_LABELS[newLoan.category],
      oldHP: '-',
      newHP: '-',
      amount: Number(newLoan.amount),
      interestRate: 0,
      tenure: 0,
      days: 0,
      pddStatus: 'Pending',
      bankName: newLoan.bankName,
      status: 'pending',
      employeeName: newLoan.employeeName || 'Self',
      managerName: '-',
      dsaPartner: newLoan.dsaPartner || '-',
      whoWeAre: 'DSA',
      disbursementDate: '',
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDisbursements([loan, ...disbursements]);
    setNewLoan({ applicantName: '', category: 'personal_loan', amount: '', bankName: '', employeeName: '', dsaPartner: '' });
    setShowAddForm(false);
    toast({ title: 'Loan Added', description: `Disbursement for ${loan.applicantName} created successfully.` });
  };

  const exportCSV = () => {
    const headers = ['Date', 'Customer Name', 'Mob. No', 'Lender/Case Type', 'Old HP', 'New HP', 'Loan Amount', 'Interest/Tenure', 'Days', 'PDD Status', 'Executive', 'Manager', 'Who We Are', 'Status'];
    const rows = filtered.map(d => [
      d.createdAt, d.applicantName, d.mobileNumber, `${d.lenderName} / ${d.caseType}`,
      d.oldHP, d.newHP, d.amount, `${d.interestRate}% / ${d.tenure}mo`, d.days,
      d.pddStatus, d.employeeName, d.managerName, d.whoWeAre, d.status,
    ]);
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `loan_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Export complete', description: `${filtered.length} records exported to CSV.` });
  };

  const categoryStats = Object.entries(LOAN_CATEGORY_LABELS).map(([key, label]) => {
    const items = disbursements.filter(d => d.category === key);
    const total = items.reduce((s, d) => s + d.amount, 0);
    return { key, label, count: items.length, total };
  });

  const formatAmount = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  return (
    <AppLayout>
      <div className="space-y-4 md:space-y-6 pb-20 md:pb-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-display font-bold text-foreground">Loan Disbursement</h1>
            <p className="text-muted-foreground mt-0.5 text-xs md:text-sm">
              {permissions.loanDisbursement.edit ? 'Track & update disbursements' : 'View disbursement status'}
            </p>
          </div>
          <div className="hidden md:flex gap-2">
            {permissions.loanDisbursement.add && (
              <Button onClick={() => navigate('/loan-disbursement/new')} className="gradient-accent text-accent-foreground border-0 hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" /> Add Loan
              </Button>
            )}
            {(role === 'super_admin' || role === 'admin') && (
              <Button variant="outline" onClick={exportCSV}>
                <Download className="w-4 h-4 mr-2" /> Export
              </Button>
            )}
          </div>
        </div>

        {/* Category chips */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
          {categoryStats.map(cat => (
            <button
              key={cat.key}
              onClick={() => setCategoryFilter(categoryFilter === cat.key ? 'all' : cat.key)}
              className={`p-2.5 md:p-4 rounded-xl border text-left transition-all duration-200 ${
                categoryFilter === cat.key ? 'border-accent bg-accent/5 shadow-card' : 'border-border bg-card hover:border-accent/30'
              }`}
            >
              <p className="text-[9px] md:text-xs text-muted-foreground font-medium truncate">{cat.label}</p>
              <p className="text-base md:text-xl font-display font-bold text-card-foreground mt-0.5">{cat.count}</p>
              <p className="text-[9px] md:text-[10px] text-muted-foreground">₹{(cat.total / 100000).toFixed(1)}L</p>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-2 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search name, mobile, bank..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-32 md:w-44">
              <Filter className="w-3.5 h-3.5 mr-1 text-muted-foreground" />
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border z-50">
              <SelectItem value="all">All</SelectItem>
              {Object.entries(LOAN_CATEGORY_LABELS).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-3">
          {filtered.map(d => (
            <button
              key={d.id}
              onClick={() => navigate(`/loan-disbursement/${d.id}`)}
              className="w-full text-left bg-card rounded-xl p-4 border border-border shadow-card hover:shadow-elevated hover:border-accent/20 transition-all"
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm text-card-foreground truncate">{d.applicantName}</p>
                  <p className="text-xs text-muted-foreground">{d.lenderName} · {d.caseType}</p>
                </div>
                <StatusBadge status={d.status} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-[9px] text-muted-foreground">Amount</p>
                  <p className="text-xs font-bold text-card-foreground">{formatAmount(d.amount)}</p>
                  <p className="text-[9px] text-muted-foreground">{d.interestRate}% / {d.tenure}mo</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-[9px] text-muted-foreground">Executive</p>
                  <p className="text-xs font-medium text-card-foreground truncate">{d.employeeName}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <p className="text-[9px] text-muted-foreground">PDD</p>
                  <p className={`text-xs font-semibold ${d.pddStatus === 'Completed' ? 'text-success' : 'text-warning'}`}>{d.pddStatus}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2.5">
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span>{d.createdAt}</span>
                  <span>·</span>
                  <span>{d.days} days</span>
                  <span>·</span>
                  <span className="font-medium text-accent">{d.whoWeAre}</span>
                </div>
                <span className="text-xs text-accent font-medium flex items-center gap-1">
                  Details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Desktop Table — detailed like reference */}
        <div className="hidden md:block bg-card rounded-xl shadow-card border border-border overflow-hidden">
          <ScrollArea className="w-full">
            <div className="min-w-[1400px]">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedIds.size === filtered.length && filtered.length > 0}
                        onCheckedChange={toggleSelectAll}
                        className="h-4 w-4"
                      />
                    </TableHead>
                    <TableHead className="min-w-[90px] text-[10px] font-bold uppercase tracking-wider">Date</TableHead>
                    <TableHead className="min-w-[130px] text-[10px] font-bold uppercase tracking-wider">Customer Name</TableHead>
                    <TableHead className="min-w-[100px] text-[10px] font-bold uppercase tracking-wider">Mob. No</TableHead>
                    <TableHead className="min-w-[130px] text-[10px] font-bold uppercase tracking-wider">Lender/Case Type</TableHead>
                    <TableHead className="min-w-[120px] text-[10px] font-bold uppercase tracking-wider">Old HP</TableHead>
                    <TableHead className="min-w-[120px] text-[10px] font-bold uppercase tracking-wider">New HP</TableHead>
                    <TableHead className="min-w-[120px] text-[10px] font-bold uppercase tracking-wider">Loan Amount</TableHead>
                    <TableHead className="min-w-[50px] text-[10px] font-bold uppercase tracking-wider text-center">Days</TableHead>
                    <TableHead className="min-w-[80px] text-[10px] font-bold uppercase tracking-wider text-center">PDD Status</TableHead>
                    <TableHead className="min-w-[120px] text-[10px] font-bold uppercase tracking-wider">Executive</TableHead>
                    <TableHead className="min-w-[120px] text-[10px] font-bold uppercase tracking-wider">Manager</TableHead>
                    <TableHead className="min-w-[80px] text-[10px] font-bold uppercase tracking-wider">Who We Are</TableHead>
                    <TableHead className="min-w-[100px] text-[10px] font-bold uppercase tracking-wider text-center">Actions</TableHead>
                    <TableHead className="min-w-[110px] text-[10px] font-bold uppercase tracking-wider text-center">Update PDD</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(d => (
                    <TableRow key={d.id} className="hover:bg-muted/20 transition-colors">
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(d.id)}
                          onCheckedChange={() => toggleSelect(d.id)}
                          className="h-4 w-4"
                        />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{d.createdAt}</TableCell>
                      <TableCell>
                        <p className="text-sm font-bold text-card-foreground uppercase">{d.applicantName}</p>
                      </TableCell>
                      <TableCell className="text-xs text-card-foreground font-mono">{d.mobileNumber}</TableCell>
                      <TableCell>
                        <p className="text-xs font-medium text-card-foreground">{d.lenderName}</p>
                        <p className="text-[10px] text-muted-foreground">{d.caseType}</p>
                      </TableCell>
                      <TableCell>
                        {d.oldHP !== '-' && d.oldHP !== 'N/A' ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-accent/10 text-accent leading-tight">
                            {d.oldHP}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">{d.oldHP}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-card-foreground">{d.newHP}</TableCell>
                      <TableCell>
                        <p className="text-sm font-bold text-card-foreground">{formatAmount(d.amount)}</p>
                        <p className="text-[10px] text-muted-foreground">{d.interestRate}% / {d.tenure}mo</p>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center min-w-[36px] px-2 py-0.5 rounded-full text-[10px] font-semibold bg-muted text-muted-foreground">
                          {d.days} days
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          d.pddStatus === 'Completed' ? 'bg-success/10 text-success' :
                          d.pddStatus === 'Pending' ? 'bg-warning/10 text-warning' :
                          'bg-muted text-muted-foreground'
                        }`}>
                          {d.pddStatus}
                        </span>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-medium text-card-foreground">{d.employeeName}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wide">SHIV-6170</p>
                      </TableCell>
                      <TableCell>
                        <p className="text-xs font-bold text-card-foreground uppercase">{d.managerName}</p>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          d.whoWeAre === 'DSA' ? 'bg-muted text-card-foreground' :
                          'bg-accent/10 text-accent'
                        }`}>
                          {d.whoWeAre}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/loan-disbursement/${d.id}`); }}
                            className="w-7 h-7 rounded-md flex items-center justify-center bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
                            title="View"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toast({ title: 'Call', description: `Calling ${d.mobileNumber}...` }); }}
                            className="w-7 h-7 rounded-md flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                            title="Call"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); navigate(`/loan-disbursement/${d.id}`); }}
                            className="w-7 h-7 rounded-md flex items-center justify-center bg-info/10 text-info hover:bg-info/20 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toast({ title: 'Documents', description: 'Opening documents...' }); }}
                            className="w-7 h-7 rounded-md flex items-center justify-center bg-warning/10 text-warning hover:bg-warning/20 transition-colors"
                            title="Documents"
                          >
                            <FileIcon className="w-3.5 h-3.5" />
                          </button>
                          {permissions.loanDisbursement.delete && (
                            <button
                              onClick={(e) => { e.stopPropagation(); toast({ title: 'Delete', description: 'Loan deleted.', variant: 'destructive' }); }}
                              className="w-7 h-7 rounded-md flex items-center justify-center bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Select defaultValue={d.pddStatus}>
                          <SelectTrigger className="h-7 text-[10px] w-24 mx-auto">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border border-border z-50">
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Completed">Completed</SelectItem>
                            <SelectItem value="N/A">N/A</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>

      {/* Add Loan Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Add Loan Disbursement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Applicant Name <span className="text-destructive">*</span></Label>
              <Input value={newLoan.applicantName} onChange={e => setNewLoan({ ...newLoan, applicantName: e.target.value })} placeholder="Enter applicant name" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Loan Category <span className="text-destructive">*</span></Label>
                <Select value={newLoan.category} onValueChange={(v) => setNewLoan({ ...newLoan, category: v as LoanCategory })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover border border-border z-50">
                    {Object.entries(LOAN_CATEGORY_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount (₹) <span className="text-destructive">*</span></Label>
                <Input type="number" value={newLoan.amount} onChange={e => setNewLoan({ ...newLoan, amount: e.target.value })} placeholder="500000" className="mt-1.5" />
              </div>
            </div>
            <div>
              <Label>Bank Name <span className="text-destructive">*</span></Label>
              <Input value={newLoan.bankName} onChange={e => setNewLoan({ ...newLoan, bankName: e.target.value })} placeholder="HDFC Bank" className="mt-1.5" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Employee Name</Label>
                <Input value={newLoan.employeeName} onChange={e => setNewLoan({ ...newLoan, employeeName: e.target.value })} placeholder="Employee handling" className="mt-1.5" />
              </div>
              <div>
                <Label>DSA Partner</Label>
                <Input value={newLoan.dsaPartner} onChange={e => setNewLoan({ ...newLoan, dsaPartner: e.target.value })} placeholder="Partner name" className="mt-1.5" />
              </div>
            </div>
            <Button onClick={handleAddLoan} className="w-full gradient-accent text-accent-foreground border-0 h-11">
              Submit Loan Disbursement
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default LoanDisbursementPage;