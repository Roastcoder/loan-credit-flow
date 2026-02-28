import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { ArrowLeft, Building2, User, Calendar, IndianRupee, Briefcase, FileText, Loader2, Phone, Percent, Clock } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { mockDisbursements } from '@/data/mockData';
import { LOAN_CATEGORY_LABELS } from '@/types';
import type { LoanDisbursement } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

const InfoCell = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="flex items-start gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
      <Icon className="w-4 h-4 text-accent" />
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-muted-foreground font-medium">{label}</p>
      <p className="text-sm font-semibold text-card-foreground truncate">{value}</p>
    </div>
  </div>
);

const LoanDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { permissions } = useRole();
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const loan = mockDisbursements.find(d => d.id === id);

  if (!loan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Loan not found</h1>
          <Button variant="outline" onClick={() => navigate('/loan-disbursement')} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const handleStatusUpdate = () => {
    if (!status) return;
    setLoading(true);
    setTimeout(() => {
      toast({ title: 'Status Updated', description: `Loan for ${loan.applicantName} marked as "${status}".` });
      setLoading(false);
      navigate('/loan-disbursement');
    }, 800);
  };

  // Details are rendered inline in section cards below

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-semibold text-foreground truncate">Loan Details</h1>
        </div>
        {/* Status Banner */}
        <div className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-display font-bold text-card-foreground">{loan.applicantName}</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              {LOAN_CATEGORY_LABELS[loan.category]} · {loan.bankName}
            </p>
          </div>
          <StatusBadge status={loan.status} />
        </div>

        {/* Section: Applicant Info */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-accent" />
            <h3 className="font-display font-semibold text-card-foreground text-sm">Applicant Information</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <InfoCell icon={User} label="Applicant" value={loan.applicantName} />
            <InfoCell icon={Phone} label="Mobile" value={loan.mobileNumber} />
            <InfoCell icon={FileText} label="Case Type" value={loan.caseType} />
            <InfoCell icon={Building2} label="Lender" value={loan.lenderName} />
            <InfoCell icon={IndianRupee} label="Amount" value={`₹${loan.amount.toLocaleString()}`} />
            <InfoCell icon={Percent} label="Interest Rate" value={`${loan.interestRate}%`} />
            <InfoCell icon={Clock} label="Tenure" value={`${loan.tenure} months`} />
            <InfoCell icon={Building2} label="Old HP" value={loan.oldHP} />
            <InfoCell icon={Building2} label="New HP" value={loan.newHP} />
          </div>
        </div>

        {/* Section: Assignment Details */}
        <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-warning" />
            <h3 className="font-display font-semibold text-card-foreground text-sm">Assignment Details</h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-4">
            <InfoCell icon={Briefcase} label="Executive" value={loan.employeeName} />
            <InfoCell icon={User} label="Manager" value={loan.managerName} />
            <InfoCell icon={User} label="DSA Partner" value={loan.dsaPartner} />
            <InfoCell icon={Briefcase} label="Who We Are" value={loan.whoWeAre} />
            <InfoCell icon={Calendar} label="Created" value={loan.createdAt} />
            <InfoCell icon={Calendar} label="Disbursement Date" value={loan.disbursementDate || 'Pending'} />
            <InfoCell icon={Clock} label="Days" value={`${loan.days} days`} />
            <InfoCell icon={FileText} label="PDD Status" value={loan.pddStatus} />
          </div>
        </div>

        {/* Update Status */}
        {permissions.loanDisbursement.edit && (
          <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-4">
            <h3 className="font-display font-semibold text-card-foreground">Update Status</h3>
            <div>
              <Label>New Status</Label>
              <Select value={status || loan.status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border border-border z-50">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="disbursed">Disbursed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleStatusUpdate} disabled={loading} className="w-full gradient-accent text-accent-foreground border-0 h-11">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Status'}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default LoanDetail;
