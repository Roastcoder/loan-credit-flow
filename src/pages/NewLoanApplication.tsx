import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Car, Home, Briefcase, Users, FileText, Loader2 } from 'lucide-react';
import AppLayout from '@/components/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { rcService } from '@/services/rcService';
import type { LoanCategory } from '@/types';

const LOAN_TYPES = [
  {
    key: 'car_loan' as LoanCategory,
    title: 'Car Loan',
    description: 'New & Used Car Loan Applications',
    icon: Car,
  },
  {
    key: 'home_loan' as LoanCategory,
    title: 'Home Loan',
    description: 'Home Loan and Loan Against Property Applications',
    icon: Home,
  },
  {
    key: 'personal_loan' as LoanCategory,
    title: 'PL / BL',
    description: 'Personal and Business Loan Applications',
    icon: Briefcase,
  },
  {
    key: 'other' as LoanCategory,
    title: 'Team Applications',
    description: 'Team Loan Applications',
    icon: Users,
  },
];

const NewLoanApplication = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const preselect = (location.state as { preselect?: LoanCategory })?.preselect || null;
  const [selectedType, setSelectedType] = useState<LoanCategory | null>(preselect);
  const [loading, setLoading] = useState(false);
  const [verifyingRC, setVerifyingRC] = useState(false);

  const [form, setForm] = useState({
    // Customer Details
    disbursementDate: '',
    channelCode: '',
    dealingPersonName: '',
    customerName: '',
    mobileNumber: '',
    // Vehicle Details (car loan)
    rcNumber: '',
    engineNumber: '',
    chassisNumber: '',
    ownerName: '',
    makerDescription: '',
    makerModel: '',
    fuelType: '',
    insuranceCompany: '',
    insuranceValidUpto: '',
    manufacturingDate: '',
    puccValidUpto: '',
    financier: '',
    financedStatus: '',
    // Loan Details
    caseType: '',
    financerName: '',
    loanAmount: '',
    rateOfInterest: '',
    tenure: '',
    // Home Loan specific
    propertyType: '',
    propertyValue: '',
    propertyLocation: '',
    // Personal/Business
    employmentType: '',
    monthlyIncome: '',
    existingEmi: '',
    purpose: '',
    bankName: '',
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  const handleVerifyRC = async () => {
    if (!form.rcNumber) {
      toast({ title: 'Error', description: 'Please enter RC number', variant: 'destructive' });
      return;
    }
    setVerifyingRC(true);
    try {
      const result = await rcService.verifyRC(form.rcNumber);
      if (result.success && result.data) {
        const d = result.data;
        
        // Convert YYYY-MM format to YYYY-MM-01 for date input
        let mfgDate = '';
        if (d.manufacturing_date_formatted) {
          mfgDate = d.manufacturing_date_formatted + '-01';
        }
        
        setForm(prev => ({
          ...prev,
          ownerName: d.owner_name || prev.ownerName,
          makerDescription: d.maker_description || prev.makerDescription,
          makerModel: d.maker_model || prev.makerModel,
          fuelType: d.fuel_type || prev.fuelType,
          chassisNumber: d.vehicle_chasi_number || prev.chassisNumber,
          engineNumber: d.vehicle_engine_number || prev.engineNumber,
          financier: d.financer || prev.financier,
          financedStatus: d.financed ? 'Financed' : 'Not Financed',
          manufacturingDate: mfgDate || prev.manufacturingDate,
          insuranceCompany: d.insurance_company || prev.insuranceCompany,
          insuranceValidUpto: d.insurance_upto || prev.insuranceValidUpto,
          puccValidUpto: d.pucc_upto || prev.puccValidUpto,
        }));
        toast({ title: 'RC Verified!', description: `Vehicle details fetched for ${d.owner_name}` });
      }
    } catch (error: any) {
      toast({ title: 'Verification Failed', description: error.message, variant: 'destructive' });
    } finally {
      setVerifyingRC(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.customerName || !form.mobileNumber || !form.loanAmount) {
      toast({ title: 'Missing fields', description: 'Please fill all required fields.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      toast({ title: 'Application Submitted!', description: `${LOAN_TYPES.find(t => t.key === selectedType)?.title} application for ${form.customerName} created.` });
      setLoading(false);
      navigate('/loan-disbursement');
    }, 1000);
  };

  // Step 1: Type Selection
  if (!selectedType) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-5xl">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Create a New Application</h1>
            <p className="text-muted-foreground mt-1 text-sm">Select the type of application you want to create.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {LOAN_TYPES.map(type => (
              <button
                key={type.key}
                onClick={() => setSelectedType(type.key)}
                className="bg-card rounded-xl border border-border shadow-card p-6 text-left hover:shadow-elevated hover:border-accent/30 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                    <type.icon className="w-5 h-5 text-accent" />
                  </div>
                </div>
                <h3 className="text-base font-display font-bold text-card-foreground">{type.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{type.description}</p>
              </button>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const isCarLoan = selectedType === 'car_loan' || selectedType === 'used_car_loan';
  const isHomeLoan = selectedType === 'home_loan';
  const isPersonalBusiness = selectedType === 'personal_loan' || selectedType === 'business_loan';
  const typeLabel = LOAN_TYPES.find(t => t.key === selectedType)?.title || 'Loan';

  // Step 2: Application Form
  return (
    <AppLayout>
      <div className="max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedType(null)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-display font-bold text-foreground">{typeLabel} Application</h1>
            <p className="text-sm text-muted-foreground">Fill in all the required details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section: Customer Details */}
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <h2 className="font-display font-semibold text-card-foreground">Customer Details</h2>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Disbursement Date <span className="text-destructive">*</span></Label>
                  <Input type="date" value={form.disbursementDate} onChange={e => update('disbursementDate', e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Channel Code <span className="text-destructive">*</span></Label>
                  <Input value={form.channelCode} onChange={e => update('channelCode', e.target.value)} placeholder="Enter channel code" className="mt-1.5" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Dealing Person Name <span className="text-destructive">*</span></Label>
                  <Input value={form.dealingPersonName} onChange={e => update('dealingPersonName', e.target.value)} placeholder="Enter dealing person name" className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Customer Name <span className="text-destructive">*</span></Label>
                  <Input value={form.customerName} onChange={e => update('customerName', e.target.value)} placeholder="Enter customer name" className="mt-1.5" required />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Mobile Number <span className="text-destructive">*</span></Label>
                  <Input type="tel" value={form.mobileNumber} onChange={e => update('mobileNumber', e.target.value)} placeholder="Enter 10-digit mobile number" className="mt-1.5" required />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Vehicle Details (Car Loan only) */}
          {isCarLoan && (
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-warning" />
                <h2 className="font-display font-semibold text-card-foreground">Vehicle Details</h2>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">RC Number <span className="text-destructive">*</span></Label>
                    <div className="flex gap-2 mt-1.5">
                      <Input value={form.rcNumber} onChange={e => update('rcNumber', e.target.value.toUpperCase())} placeholder="Enter RC number" />
                      <Button type="button" onClick={handleVerifyRC} disabled={verifyingRC} variant="outline" className="whitespace-nowrap">
                        {verifyingRC ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Engine Number <span className="text-destructive">*</span></Label>
                    <Input value={form.engineNumber} onChange={e => update('engineNumber', e.target.value)} placeholder="Enter engine number" className="mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Chassis Number <span className="text-destructive">*</span></Label>
                    <Input value={form.chassisNumber} onChange={e => update('chassisNumber', e.target.value)} placeholder="Enter chassis number" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Owner Name</Label>
                    <Input value={form.ownerName} onChange={e => update('ownerName', e.target.value)} placeholder="Owner name" className="mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Maker Description</Label>
                    <Input value={form.makerDescription} onChange={e => update('makerDescription', e.target.value)} placeholder="Maker description" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Maker Model</Label>
                    <Input value={form.makerModel} onChange={e => update('makerModel', e.target.value)} placeholder="Maker model" className="mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Fuel Type</Label>
                    <Input value={form.fuelType} onChange={e => update('fuelType', e.target.value)} placeholder="Fuel type" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Insurance Company</Label>
                    <Input value={form.insuranceCompany} onChange={e => update('insuranceCompany', e.target.value)} placeholder="Insurance company" className="mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Insurance Valid Upto</Label>
                    <Input type="date" value={form.insuranceValidUpto} onChange={e => update('insuranceValidUpto', e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Manufacturing Date</Label>
                    <Input type="date" value={form.manufacturingDate} onChange={e => update('manufacturingDate', e.target.value)} className="mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">PUCC Valid Upto</Label>
                    <Input type="date" value={form.puccValidUpto} onChange={e => update('puccValidUpto', e.target.value)} className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Financier</Label>
                    <Input value={form.financier} onChange={e => update('financier', e.target.value)} placeholder="Financier name" className="mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Financed Status</Label>
                    <Input value={form.financedStatus} onChange={e => update('financedStatus', e.target.value)} placeholder="Financed status" className="mt-1.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Case Details (Home Loan only) */}
          {isHomeLoan && (
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-info" />
                <h2 className="font-display font-semibold text-card-foreground">Case Details</h2>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Case Type</Label>
                    <Select value={form.caseType} onValueChange={v => update('caseType', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select Case Type" /></SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="home-loan">Home Loan</SelectItem>
                        <SelectItem value="lap">LAP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Property Type</Label>
                    <Select value={form.propertyType} onValueChange={v => update('propertyType', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select Property Type" /></SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="residential">Residential</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-xs font-semibold">Property Registration Type</Label>
                  <Select value={form.propertyLocation} onValueChange={v => update('propertyLocation', v)}>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select Registration Type" /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="registered">Registered</SelectItem>
                      <SelectItem value="unregistered">Unregistered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Section: Employment Details (Personal / Business Loan) */}
          {isPersonalBusiness && (
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-info" />
                <h2 className="font-display font-semibold text-card-foreground">Employment Details</h2>
              </div>
              <div className="p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Employment Type <span className="text-destructive">*</span></Label>
                    <Select value={form.employmentType} onValueChange={v => update('employmentType', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select employment type" /></SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="salaried">Salaried</SelectItem>
                        <SelectItem value="self_employed">Self Employed</SelectItem>
                        <SelectItem value="business">Business Owner</SelectItem>
                        <SelectItem value="professional">Professional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Monthly Income (₹) <span className="text-destructive">*</span></Label>
                    <Input type="number" value={form.monthlyIncome} onChange={e => update('monthlyIncome', e.target.value)} placeholder="Monthly income" className="mt-1.5" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Existing EMI (₹)</Label>
                    <Input type="number" value={form.existingEmi} onChange={e => update('existingEmi', e.target.value)} placeholder="Total existing EMIs" className="mt-1.5" />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Purpose of Loan</Label>
                    <Input value={form.purpose} onChange={e => update('purpose', e.target.value)} placeholder="Purpose of loan" className="mt-1.5" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section: Finance Details (Home Loan) / Loan Details (Other types) */}
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-destructive" />
              <h2 className="font-display font-semibold text-card-foreground">{isHomeLoan ? 'Finance Details' : 'Loan Details'}</h2>
            </div>
            <div className="p-4 md:p-6 space-y-4">
              {!isHomeLoan && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Case Type <span className="text-destructive">*</span></Label>
                    <Select value={form.caseType} onValueChange={v => update('caseType', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select case type" /></SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="top_up">Top Up</SelectItem>
                        <SelectItem value="balance_transfer">Balance Transfer</SelectItem>
                        <SelectItem value="bt_top_up">BT + Top Up</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Bank / Financer Name <span className="text-destructive">*</span></Label>
                    <Input value={form.bankName} onChange={e => update('bankName', e.target.value)} placeholder="Select financer" className="mt-1.5" />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isHomeLoan && (
                  <div>
                    <Label className="text-xs font-semibold">Financier</Label>
                    <Select value={form.bankName} onValueChange={v => update('bankName', v)}>
                      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select Financier" /></SelectTrigger>
                      <SelectContent className="bg-popover border border-border z-50">
                        <SelectItem value="hdfc">HDFC Bank</SelectItem>
                        <SelectItem value="icici">ICICI Bank</SelectItem>
                        <SelectItem value="sbi">SBI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {!isHomeLoan && (
                  <div>
                    <Label className="text-xs font-semibold">Loan Amount (₹) <span className="text-destructive">*</span></Label>
                    <Input type="number" value={form.loanAmount} onChange={e => update('loanAmount', e.target.value)} placeholder="Enter loan amount" className="mt-1.5" required />
                  </div>
                )}
                <div>
                  <Label className="text-xs font-semibold">{isHomeLoan ? 'ROI (Rate of Interest %)' : 'Rate of Interest (%)'}</Label>
                  <Input type="number" step="0.01" value={form.rateOfInterest} onChange={e => update('rateOfInterest', e.target.value)} placeholder="Enter ROI" className="mt-1.5" />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Tenure (in Months)</Label>
                  <Input type="number" value={form.tenure} onChange={e => update('tenure', e.target.value)} placeholder="Enter tenure" className="mt-1.5" />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Final Status (Home Loan only) */}
          {isHomeLoan && (
            <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
              <div className="p-4 border-b border-border bg-muted/30 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-success" />
                <h2 className="font-display font-semibold text-card-foreground">Final Status</h2>
              </div>
              <div className="p-4 md:p-6">
                <div>
                  <Label className="text-xs font-semibold">Final Status</Label>
                  <Select>
                    <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select Final Status" /></SelectTrigger>
                    <SelectContent className="bg-popover border border-border z-50">
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Submit */}
          <div className="flex justify-end pb-6">
            <Button type="submit" disabled={loading} className="gradient-accent text-accent-foreground border-0 h-11 px-8 text-sm font-semibold">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
              Submit Application
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
};

export default NewLoanApplication;
