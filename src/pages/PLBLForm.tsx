import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

const PLBLForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    customerName: '', mobileNumber: '', loanType: '', loanAmount: '', interestRate: '',
    tenure: '', financier: '', channelName: '', channelCode: '', disbursedDate: '',
    dealingPerson: '', pddStatus: '', caseType: '', existingLender: '', rcCollection: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    toast({ title: 'Success', description: 'PL/BL application submitted successfully' });
    navigate('/loan-disbursement');
  };

  return (
    <AppLayout>
      <div className="space-y-4 pb-20 md:pb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="md:flex hidden">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold">PL/BL Disbursement Form</h1>
            <p className="text-xs md:text-sm text-muted-foreground">Personal Loan / Business Loan Application</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-4 md:p-6 shadow-card border border-border space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customerName">Customer Name *</Label>
              <Input id="customerName" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="mobileNumber">Mobile Number *</Label>
              <Input id="mobileNumber" type="tel" value={form.mobileNumber} onChange={e => setForm({...form, mobileNumber: e.target.value})} required className="mt-1.5" maxLength={10} />
            </div>
            <div>
              <Label htmlFor="loanType">Loan Type *</Label>
              <Select value={form.loanType} onValueChange={val => setForm({...form, loanType: val})}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select loan type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Personal Loan</SelectItem>
                  <SelectItem value="business">Business Loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="loanAmount">Loan Amount *</Label>
              <Input id="loanAmount" type="number" value={form.loanAmount} onChange={e => setForm({...form, loanAmount: e.target.value})} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="interestRate">Interest Rate (%) *</Label>
              <Input id="interestRate" type="number" step="0.01" value={form.interestRate} onChange={e => setForm({...form, interestRate: e.target.value})} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="tenure">Tenure (Months) *</Label>
              <Input id="tenure" type="number" value={form.tenure} onChange={e => setForm({...form, tenure: e.target.value})} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="financier">Financier *</Label>
              <Input id="financier" value={form.financier} onChange={e => setForm({...form, financier: e.target.value})} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="caseType">Case Type</Label>
              <Select value={form.caseType} onValueChange={val => setForm({...form, caseType: val})}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select case type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="existing">Existing</SelectItem>
                  <SelectItem value="takeover">Takeover</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="existingLender">Existing Lender</Label>
              <Input id="existingLender" value={form.existingLender} onChange={e => setForm({...form, existingLender: e.target.value})} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="channelName">Channel Name *</Label>
              <Input id="channelName" value={form.channelName} onChange={e => setForm({...form, channelName: e.target.value})} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="channelCode">Channel Code *</Label>
              <Input id="channelCode" value={form.channelCode} onChange={e => setForm({...form, channelCode: e.target.value})} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="disbursedDate">Disbursed Date *</Label>
              <Input id="disbursedDate" type="date" value={form.disbursedDate} onChange={e => setForm({...form, disbursedDate: e.target.value})} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="dealingPerson">Dealing Person</Label>
              <Input id="dealingPerson" value={form.dealingPerson} onChange={e => setForm({...form, dealingPerson: e.target.value})} className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="pddStatus">PDD Status</Label>
              <Select value={form.pddStatus} onValueChange={val => setForm({...form, pddStatus: val})}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select PDD status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate(-1)} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1 gradient-accent text-accent-foreground border-0">
              <Save className="w-4 h-4 mr-2" /> Submit Application
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default PLBLForm;
