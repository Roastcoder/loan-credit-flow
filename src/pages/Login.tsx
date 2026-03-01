import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CreditCard, FileText, Loader2, Shield } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

import Footer from '@/components/Footer';
import { useRole, DEMO_USERS } from '@/contexts/RoleContext';
import { ROLE_LABELS } from '@/types';
import { aadhaarKycService } from '@/services/aadhaarKyc';
import { panService } from '@/services/panService';
import { smsService } from '@/services/smsService';
import { customAuth } from '@/services/customAuth';
import { toast } from '@/hooks/use-toast';
import authHero from '@/assets/auth-hero.jpg';

type AuthView = 'login' | 'signup' | 'forgot';
type SignupStep = 'pan' | 'otp' | 'employee' | 'aadhaar' | 'bank' | 'mpin';

const Login = () => {
  const [view, setView] = useState<AuthView>('login');
  const [signupStep, setSignupStep] = useState<SignupStep>('pan');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setRole, setIsLoggedIn, setIsDemoMode, signUp, signIn, resetPassword } = useRole();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', mobile: '', email: '', mpin: '', confirmPassword: '', pan: '', otp: '', aadhaar: '', aadhaarOtp: '', aadhaarRequestId: '', aadhaarName: '', aadhaarAddress: '', aadhaarFatherName: '', aadhaarPhoto: '', bankAccount: '', ifsc: '', teamNumber: '', employeeType: '', channelCode: '', dob: '', loginIdentifier: '', creditCardsAccess: false, loanDisbursementAccess: false });
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [otpTimer, setOtpTimer] = useState(0);

  const handleDemoLogin = (userId: string) => {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
      setIsDemoMode(true);
      setRole(user.role);
      setIsLoggedIn(true);
      navigate('/');
    }
  };

  const handleSignupNext = async () => {
    setLoading(true);
    try {
      if (signupStep === 'pan') {
        if (form.pan.length !== 10) {
          toast({ title: 'Error', description: 'PAN must be 10 characters.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        try {
          const response = await panService.verifyPan(form.pan);
          console.log('PAN Response:', response);
          if (response.success === true && response.data?.status === 'valid') {
            const fullName = response.data.full_name || 'User';
            const dob = response.data.dob || '';
            setForm({ ...form, name: fullName, dob });
            toast({ title: 'PAN Verified', description: `Welcome, ${fullName}` });
            setSignupStep('otp');
          } else {
            throw new Error(response.message || 'Invalid PAN details');
          }
        } catch (err: any) {
          console.error('PAN Error:', err);
          toast({ title: 'Error', description: err.message || 'PAN verification failed', variant: 'destructive' });
        }
        return;
      } else if (signupStep === 'otp') {
        if (form.mobile.length !== 10) {
          toast({ title: 'Error', description: 'Mobile number must be 10 digits.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        if (form.otp.length !== 6) {
          toast({ title: 'Error', description: 'OTP must be 6 digits.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        if (form.otp !== generatedOtp.toString()) {
          toast({ title: 'Error', description: 'Invalid OTP. Please try again.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        toast({ title: 'OTP Verified', description: 'Mobile number verified successfully.' });
        setSignupStep('employee');
      } else if (signupStep === 'employee') {
        if (!form.employeeType) {
          toast({ title: 'Error', description: 'Please select employee type.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        const namePrefix = form.name.substring(0, 4).toUpperCase().padEnd(4, 'X');
        const randomDigits = Math.floor(1000 + Math.random() * 9000);
        const channelCode = `${namePrefix}${randomDigits}`;
        setForm({ ...form, channelCode });
        toast({ title: 'Channel Code Generated', description: `Your code: ${channelCode}` });
        setSignupStep('aadhaar');
      } else if (signupStep === 'aadhaar') {
        if (!aadhaarOtpSent) {
          if (form.aadhaar.length !== 12) {
            toast({ title: 'Error', description: 'Aadhaar must be 12 digits.', variant: 'destructive' });
            setLoading(false);
            return;
          }
          try {
            const response = await aadhaarKycService.sendOtp(form.aadhaar);
            setForm({ ...form, aadhaarRequestId: response.request_id });
            setAadhaarOtpSent(true);
            toast({ title: 'OTP Sent', description: 'OTP sent to Aadhaar registered mobile.' });
          } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
          }
        } else {
          if (form.aadhaarOtp.length !== 6) {
            toast({ title: 'Error', description: 'OTP must be 6 digits.', variant: 'destructive' });
            setLoading(false);
            return;
          }
          try {
            const verifyResult = await aadhaarKycService.verifyOtp(form.aadhaar, form.aadhaarOtp, form.aadhaarRequestId);
            setForm({ 
              ...form, 
              aadhaarName: verifyResult.name || form.name,
              aadhaarAddress: verifyResult.address || '',
              aadhaarFatherName: verifyResult.father_name || '',
              aadhaarPhoto: verifyResult.photo || '',
            });
            toast({ title: 'Aadhaar Verified', description: 'Aadhaar verified successfully.' });
            setSignupStep('bank');
            setAadhaarOtpSent(false);
          } catch (err: any) {
            toast({ title: 'Error', description: err.message, variant: 'destructive' });
          }
        }
        return;
      } else if (signupStep === 'bank') {
        if (!form.bankAccount || !form.ifsc) {
          toast({ title: 'Error', description: 'Please enter bank details.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        toast({ title: 'Bank Verified', description: 'Bank details verified successfully.' });
        setSignupStep('mpin');
      } else if (signupStep === 'mpin') {
        if (form.mpin !== form.confirmPassword) {
          toast({ title: 'Error', description: 'MPINs do not match.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        if (form.mpin.length !== 4) {
          toast({ title: 'Error', description: 'MPIN must be 4 digits.', variant: 'destructive' });
          setLoading(false);
          return;
        }
        const result = await customAuth.signUp(form.mobile, form.mpin, form.name, form.employeeType, form.channelCode, form.pan, form.dob, form.aadhaar, form.aadhaarName, form.aadhaarAddress, form.aadhaarFatherName, form.aadhaarPhoto, form.email, form.bankAccount, form.ifsc, form.creditCardsAccess, form.loanDisbursementAccess);
        if (result.error) throw result.error;
        setIsLoggedIn(true);
        localStorage.setItem('hasSeenOnboarding', 'true');
        toast({ title: 'Account created!', description: 'Your account has been created successfully.' });
        window.location.href = '/';
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async () => {
    if (form.mobile.length !== 10) {
      toast({ title: 'Error', description: 'Enter valid mobile number.', variant: 'destructive' });
      return;
    }
    try {
      const { otp } = await smsService.sendOtp(form.mobile);
      setGeneratedOtp(otp.toString());
      setOtpTimer(60);
      toast({ title: 'OTP Sent', description: 'OTP sent to your mobile number.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Failed to send OTP', variant: 'destructive' });
    }
  };

  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [otpTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (view === 'forgot') {
        const { error } = await resetPassword(form.mobile);
        if (error) throw error;
        toast({ title: 'Reset link sent', description: 'Check your mobile for the reset link.' });
        setView('login');
      } else {
        if (form.mpin.length !== 4) {
          toast({ title: 'Error', description: 'MPIN must be 4 digits.', variant: 'destructive' });
          return;
        }
        setIsDemoMode(false);
        const result = await customAuth.signIn(form.loginIdentifier, form.mpin);
        if (result.error) throw result.error;
        setIsLoggedIn(true);
        localStorage.setItem('hasSeenOnboarding', 'true');
        window.location.href = '/';
      }
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Something went wrong', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          <img src={authHero} alt="Finonest Platform" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 gradient-hero opacity-80" />
          <div className="relative z-10 flex flex-col justify-between p-12 text-sidebar-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="w-44 h-12">
                <img src="/finonest-logo.png" alt="Finonest" className="w-full h-full object-contain brightness-0 invert" />
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <h2 className="text-4xl font-display font-bold leading-tight">Manage Credit Cards<br />& Loan Disbursements</h2>
                <p className="mt-4 text-lg opacity-80 max-w-md">Complete SaaS platform for DSA partners, employees, and administrators.</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-sidebar-accent/30 rounded-lg p-4">
                  <CreditCard className="w-6 h-6 text-sidebar-primary" />
                  <div>
                    <p className="font-semibold text-sm">Credit Card Module</p>
                    <p className="text-xs opacity-70">Product management & DSA commissions</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 bg-sidebar-accent/30 rounded-lg p-4">
                  <FileText className="w-6 h-6 text-sidebar-primary" />
                  <div>
                    <p className="font-semibold text-sm">Loan Disbursement</p>
                    <p className="text-xs opacity-70">Track all loan categories in real-time</p>
                  </div>
                </div>
              </div>
            </div>
            <p className="text-xs opacity-50">© 2026 Finonest. All rights reserved.</p>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col bg-background">
          <div className="lg:hidden gradient-hero px-5 pt-10 pb-8 text-center">
            <div className="flex items-center justify-center mb-3">
              <div className="w-48 h-14">
                <img src="/finonest-logo.png" alt="Finonest" className="w-full h-full object-contain brightness-0 invert" />
              </div>
            </div>
            <p className="text-white/60 text-xs">Credit Cards & Loan Management Platform</p>
          </div>

          <div className="flex-1 flex items-start lg:items-center justify-center px-5 py-6 lg:p-8">
            <div className="w-full max-w-md space-y-5">
              <div>
                <h2 className="text-xl md:text-3xl font-display font-bold text-foreground">
                  {view === 'login' && 'Welcome back'}
                  {view === 'signup' && 'Create account'}
                  {view === 'forgot' && 'Reset password'}
                </h2>
                <p className="text-muted-foreground mt-1 text-sm">
                  {view === 'login' && 'Sign in with mobile or email'}
                  {view === 'signup' && `Step ${signupStep === 'pan' ? '1' : signupStep === 'otp' ? '2' : signupStep === 'employee' ? '3' : signupStep === 'aadhaar' ? '4' : signupStep === 'bank' ? '5' : '6'} of 6`}
                  {view === 'forgot' && 'Enter your mobile number to reset MPIN'}
                </p>
              </div>

              {view === 'signup' ? (
                <div className="space-y-4">
                  {signupStep === 'pan' && (
                    <>
                      <div>
                        <Label htmlFor="pan">PAN Number</Label>
                        <Input id="pan" placeholder="Enter 10-character PAN" value={form.pan} onChange={e => setForm({ ...form, pan: e.target.value.toUpperCase().slice(0, 10) })} className="mt-1.5 h-11" required maxLength={10} />
                      </div>
                      <Button type="button" onClick={handleSignupNext} disabled={loading} className="w-full gradient-accent text-accent-foreground border-0 h-12 text-sm font-semibold">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify PAN'}
                      </Button>
                    </>
                  )}
                  {signupStep === 'otp' && (
                    <>
                      <div>
                        <Label htmlFor="name">Full Name (Auto-fetched)</Label>
                        <Input id="name" value={form.name} className="mt-1.5 h-11 bg-muted" disabled />
                      </div>
                      <div>
                        <Label htmlFor="mobile">Mobile Number</Label>
                        <Input id="mobile" type="tel" placeholder="Enter 10-digit mobile number" value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })} className="mt-1.5 h-11" required maxLength={10} />
                        <Button type="button" onClick={handleSendOTP} disabled={otpTimer > 0} className="w-full mt-2 h-9 text-xs" variant="outline">
                          {otpTimer > 0 ? `Resend OTP in ${otpTimer}s` : 'Send OTP'}
                        </Button>
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" placeholder="Enter your email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-1.5 h-11" required />
                      </div>
                      <div>
                        <Label htmlFor="otp">Enter OTP</Label>
                        <Input id="otp" type="text" inputMode="numeric" placeholder="Enter 6-digit OTP" value={form.otp} onChange={e => setForm({ ...form, otp: e.target.value.replace(/\D/g, '').slice(0, 6) })} className="mt-1.5 h-11 text-center text-xl tracking-widest" required maxLength={6} />
                      </div>
                      <Button type="button" onClick={handleSignupNext} disabled={loading} className="w-full gradient-accent text-accent-foreground border-0 h-12 text-sm font-semibold">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify OTP'}
                      </Button>
                    </>
                  )}
                  {signupStep === 'employee' && (
                    <>
                      <div>
                        <Label htmlFor="employeeType">Employee Type</Label>
                        <select
                          id="employeeType"
                          value={form.employeeType}
                          onChange={e => setForm({ ...form, employeeType: e.target.value })}
                          className="w-full mt-1.5 h-11 px-3 rounded-md border border-input bg-background"
                          required
                        >
                          <option value="">Select Type</option>
                          <option value="DSA">DSA (Direct Selling Agent)</option>
                          <option value="DST">DST (Finonest Employee)</option>
                        </select>
                        <p className="text-xs text-muted-foreground mt-1">Channel code will be auto-generated</p>
                      </div>
                      <div className="space-y-3">
                        <Label>Module Access</Label>
                        <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-lg">
                          <input
                            type="checkbox"
                            id="creditCards"
                            checked={form.creditCardsAccess}
                            onChange={e => setForm({ ...form, creditCardsAccess: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <label htmlFor="creditCards" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-accent" />
                            Credit Cards
                          </label>
                        </div>
                        <div className="flex items-center space-x-2 bg-muted/30 p-3 rounded-lg">
                          <input
                            type="checkbox"
                            id="loanDisbursement"
                            checked={form.loanDisbursementAccess}
                            onChange={e => setForm({ ...form, loanDisbursementAccess: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <label htmlFor="loanDisbursement" className="text-sm font-medium cursor-pointer flex items-center gap-2">
                            <FileText className="w-4 h-4 text-accent" />
                            Loan Disbursement
                          </label>
                        </div>
                      </div>
                      <Button type="button" onClick={handleSignupNext} disabled={loading} className="w-full gradient-accent text-accent-foreground border-0 h-12 text-sm font-semibold">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Code'}
                      </Button>
                    </>
                  )}
                  {signupStep === 'aadhaar' && (
                    <>
                      <div>
                        <Label htmlFor="aadhaar">Aadhaar Number</Label>
                        <Input id="aadhaar" type="text" inputMode="numeric" placeholder="Enter 12-digit Aadhaar" value={form.aadhaar} onChange={e => setForm({ ...form, aadhaar: e.target.value.replace(/\D/g, '').slice(0, 12) })} className="mt-1.5 h-11" required maxLength={12} disabled={aadhaarOtpSent} />
                      </div>
                      {aadhaarOtpSent && (
                        <div>
                          <Label htmlFor="aadhaarOtp">Enter Aadhaar OTP</Label>
                          <Input id="aadhaarOtp" type="text" inputMode="numeric" placeholder="Enter 6-digit OTP" value={form.aadhaarOtp} onChange={e => setForm({ ...form, aadhaarOtp: e.target.value.replace(/\D/g, '').slice(0, 6) })} className="mt-1.5 h-11 text-center text-xl tracking-widest" required maxLength={6} />
                          <p className="text-xs text-muted-foreground mt-1">OTP sent to Aadhaar registered mobile</p>
                        </div>
                      )}
                      <Button type="button" onClick={handleSignupNext} disabled={loading} className="w-full gradient-accent text-accent-foreground border-0 h-12 text-sm font-semibold">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (aadhaarOtpSent ? 'Verify Aadhaar' : 'Send OTP')}
                      </Button>
                      <Button type="button" onClick={() => { setSignupStep('bank'); setAadhaarOtpSent(false); }} variant="outline" className="w-full h-10 text-sm">
                        Skip Aadhaar
                      </Button>
                    </>
                  )}
                  {signupStep === 'bank' && (
                    <>
                      <div>
                        <Label htmlFor="bankAccount">Bank Account Number</Label>
                        <Input id="bankAccount" type="text" placeholder="Enter account number" value={form.bankAccount} onChange={e => setForm({ ...form, bankAccount: e.target.value })} className="mt-1.5 h-11" required />
                      </div>
                      <div>
                        <Label htmlFor="ifsc">IFSC Code</Label>
                        <Input id="ifsc" placeholder="Enter IFSC code" value={form.ifsc} onChange={e => setForm({ ...form, ifsc: e.target.value.toUpperCase() })} className="mt-1.5 h-11" required />
                      </div>
                      <Button type="button" onClick={handleSignupNext} disabled={loading} className="w-full gradient-accent text-accent-foreground border-0 h-12 text-sm font-semibold">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify Bank'}
                      </Button>
                      <Button type="button" onClick={() => setSignupStep('mpin')} variant="outline" className="w-full h-10 text-sm">
                        Skip Bank
                      </Button>
                    </>
                  )}
                  {signupStep === 'mpin' && (
                    <>
                      <div>
                        <Label htmlFor="mpin">Create 4-Digit MPIN</Label>
                        <Input id="mpin" type={showPassword ? 'text' : 'password'} inputMode="numeric" placeholder="••••" value={form.mpin} onChange={e => setForm({ ...form, mpin: e.target.value.replace(/\D/g, '').slice(0, 4) })} className="mt-1.5 h-11 text-center text-2xl tracking-widest" required maxLength={4} />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm MPIN</Label>
                        <Input id="confirmPassword" type={showPassword ? 'text' : 'password'} inputMode="numeric" placeholder="••••" value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value.replace(/\D/g, '').slice(0, 4) })} className="mt-1.5 h-11 text-center text-2xl tracking-widest" required maxLength={4} />
                      </div>
                      <Button type="button" onClick={handleSignupNext} disabled={loading} className="w-full gradient-accent text-accent-foreground border-0 h-12 text-sm font-semibold">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create Account'}
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="loginIdentifier">Mobile Number or Email</Label>
                    <Input id="loginIdentifier" placeholder="Enter mobile number or email" value={form.loginIdentifier} onChange={e => setForm({ ...form, loginIdentifier: e.target.value })} className="mt-1.5 h-11" required />
                  </div>
                  {view !== 'forgot' && (
                    <div>
                      <div className="flex justify-between items-center">
                        <Label htmlFor="mpin">4-Digit MPIN</Label>
                        <button type="button" onClick={() => setView('forgot')} className="text-xs text-accent hover:underline">Forgot MPIN?</button>
                      </div>
                      <div className="relative mt-1.5">
                        <Input id="mpin" type={showPassword ? 'text' : 'password'} inputMode="numeric" placeholder="••••" value={form.mpin} onChange={e => setForm({ ...form, mpin: e.target.value.replace(/\D/g, '').slice(0, 4) })} className="h-11 text-center text-2xl tracking-widest" required maxLength={4} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  )}
                  <Button type="submit" disabled={loading} className="w-full gradient-accent text-accent-foreground border-0 h-12 text-sm font-semibold">
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (view === 'login' ? 'Sign In' : 'Send Reset Link')}
                  </Button>
                </form>
              )}

              <div className="text-center text-sm text-muted-foreground">
                {view === 'login' && (
                  <p>Don't have an account?{' '}<button onClick={() => { setView('signup'); setSignupStep('pan'); }} className="text-accent font-semibold hover:underline">Sign up</button></p>
                )}
                {view === 'signup' && (
                  <p>Already have an account?{' '}<button onClick={() => setView('login')} className="text-accent font-semibold hover:underline">Sign in</button></p>
                )}
                {view === 'forgot' && (
                  <p>Remember your password?{' '}<button onClick={() => setView('login')} className="text-accent font-semibold hover:underline">Back to sign in</button></p>
                )}
              </div>

              <div className="lg:hidden flex items-center justify-center gap-2 pt-2 text-muted-foreground/50">
                <Shield className="w-3.5 h-3.5" />
                <span className="text-[10px]">Secured & Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
