import { useState, useEffect } from 'react';
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
  const [rcVerifyCount, setRcVerifyCount] = useState(0);
  const [fetchingChallan, setFetchingChallan] = useState(false);
  const [challanData, setChallanData] = useState<any>(null);

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
    challanStatus: '',
  });

  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setForm(prev => ({
      ...prev,
      channelCode: user.channel_code || '',
      dealingPersonName: user.name || '',
    }));
  }, []);

  useEffect(() => {
    // Auto-fetch from DB when RC number is entered (10+ characters)
    if (form.rcNumber.length >= 10 && rcVerifyCount === 0) {
      const timer = setTimeout(() => {
        handleVerifyRC();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [form.rcNumber]);

  const handleVerifyRC = async () => {
    if (!form.rcNumber) {
      toast({ title: 'Error', description: 'Please enter RC number', variant: 'destructive' });
      return;
    }
    setVerifyingRC(true);
    const forceRefresh = rcVerifyCount > 0;
    try {
      const result = await rcService.verifyRC(form.rcNumber, forceRefresh);
      if (result.success && result.data) {
        const d = result.data;
        
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
          manufacturingDate: d.manufacturing_date_formatted || prev.manufacturingDate,
          insuranceCompany: d.insurance_company || prev.insuranceCompany,
          insuranceValidUpto: d.insurance_upto || prev.insuranceValidUpto,
          puccValidUpto: d.pucc_upto || prev.puccValidUpto,
        }));
        
        const source = result.fromCache ? '📦 Database' : '🌐 Live API';
        toast({ title: 'RC Verified!', description: `${source} - Vehicle details fetched for ${d.owner_name}` });
        setRcVerifyCount(prev => prev + 1);
      }
    } catch (error: any) {
      // Silent fail for auto-fetch, only show error on manual verify
      if (rcVerifyCount > 0) {
        toast({ title: 'Verification Failed', description: error.message, variant: 'destructive' });
      }
    } finally {
      setVerifyingRC(false);
    }
  };

  const handleFetchChallan = async () => {
    if (!form.rcNumber) {
      toast({ title: 'Error', description: 'Please enter RC number', variant: 'destructive' });
      return;
    }
    setFetchingChallan(true);
    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
      const response = await fetch(`${API_BASE_URL}/api/rc/challan.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rc_number: form.rcNumber }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        setChallanData(result.data);
        const challanCount = result.data.challan_details?.challans?.length || 0;
        const status = challanCount > 0 ? `${challanCount} Challan(s) Found` : 'No Challans';
        update('challanStatus', status);
        toast({ title: 'Challan Fetched', description: status });
      } else {
        throw new Error(result.message || 'Failed to fetch challan');
      }
    } catch (error: any) {
      toast({ title: 'Challan Fetch Failed', description: error.message, variant: 'destructive' });
    } finally {
      setFetchingChallan(false);
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
        <div className="-m-4 md:-m-6 lg:-m-8">
          <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
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
      <div className="-m-4 md:-m-6 lg:-m-8">
        <div className="px-4 md:px-6 lg:px-8 py-6 space-y-6">
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
                  <Input value={form.channelCode} className="mt-1.5 bg-muted" disabled readOnly />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Dealing Person Name <span className="text-destructive">*</span></Label>
                  <Input value={form.dealingPersonName} className="mt-1.5 bg-muted" disabled readOnly />
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
            <div className="bg-card rounded-xl p-6 shadow-card border border-border space-y-3">
              <input
                type="text"
                placeholder="RC Number (e.g., DL01AB1234)"
                value={form.rcNumber}
                onChange={e => update('rcNumber', e.target.value.toUpperCase())}
                className="w-full px-4 py-2.5 bg-background border-b border-border focus:border-accent outline-none transition-colors text-sm font-medium"
              />
              {(form.ownerName || form.makerDescription) && (
                <div className="px-4 py-2 bg-accent/5 rounded text-xs text-muted-foreground">
                  {form.makerDescription} {form.makerModel} ({form.manufacturingDate}) • {form.ownerName} • {form.fuelType} • Insurance: {form.insuranceCompany} (Valid: {form.insuranceValidUpto})
                </div>
              )}
              <input
                type="text"
                placeholder="Engine Number"
                value={form.engineNumber}
                onChange={e => update('engineNumber', e.target.value)}
                className="w-full px-4 py-2.5 bg-background border-b border-border focus:border-accent outline-none transition-colors text-sm"
              />
              <input
                type="text"
                placeholder="Chassis Number"
                value={form.chassisNumber}
                onChange={e => update('chassisNumber', e.target.value)}
                className="w-full px-4 py-2.5 bg-background border-b border-border focus:border-accent outline-none transition-colors text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Challan Status"
                  value={form.challanStatus}
                  readOnly
                  className="flex-1 px-4 py-2.5 bg-muted border-b border-border outline-none text-sm"
                />
                <Button type="button" onClick={handleFetchChallan} disabled={fetchingChallan} variant="outline" size="sm">
                  {fetchingChallan ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Fetch'}
                </Button>
              </div>
              {challanData && challanData.challan_details?.challans && challanData.challan_details.challans.length > 0 && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  <p className="text-xs font-semibold text-destructive mb-2">Challan Details:</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {challanData.challan_details.challans.map((challan: any, idx: number) => (
                      <div key={idx} className="text-xs bg-background/50 rounded p-2">
                        <div className="grid grid-cols-2 gap-1">
                          <span className="text-muted-foreground">Challan No:</span>
                          <span className="font-medium">{challan.challan_number || 'N/A'}</span>
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">₹{challan.amount || 'N/A'}</span>
                          <span className="text-muted-foreground">Date:</span>
                          <span className="font-medium">{challan.challan_date || 'N/A'}</span>
                          <span className="text-muted-foreground">Offense:</span>
                          <span className="font-medium">{challan.offense_details || 'N/A'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
      </div>
    </AppLayout>
  );
};

export default NewLoanApplication;
