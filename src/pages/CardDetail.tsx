import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/AppLayout';
import { ArrowLeft, Check, ExternalLink, Loader2 } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { mockCreditCards } from '@/data/mockData';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from '@/hooks/use-toast';

const CARD_IMAGES: Record<string, string> = {
  '1': 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=380&fit=crop',
  '2': 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=600&h=380&fit=crop',
  '3': 'https://images.unsplash.com/photo-1556742077-0a6b6a4a4ac4?w=600&h=380&fit=crop',
  '4': 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=380&fit=crop',
  '5': 'https://images.unsplash.com/photo-1556742393-d75f468bfcb0?w=600&h=380&fit=crop',
};

const CARD_FEATURES: Record<string, string[]> = {
  '1': ['Airport lounge access', 'Fuel surcharge waiver', '5X rewards on dining', 'Milestone benefits up to ₹15,000', 'EMI conversion available'],
  '2': ['Dedicated relationship manager', 'Business expense tracking', 'GST invoice on statement', 'Up to 50 days interest-free', 'International usage enabled'],
  '3': ['2% flat cashback', 'No minimum spend', 'Instant cashback credit', 'Zero forex markup', 'Mobile wallet top-up rewards'],
  '4': ['10X miles on flights', 'Free travel insurance', 'Priority check-in', 'Companion flight tickets', 'Hotel stay vouchers'],
  '5': ['Zero annual fee forever', 'Student-friendly limits', 'Easy EMI options', 'Digital-first card', 'Instant virtual card'],
};

const CardDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const card = mockCreditCards.find(c => c.id === id);
  if (!card) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-foreground">Card not found</h1>
          <Button variant="outline" onClick={() => navigate('/credit-cards')} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const features = CARD_FEATURES[card.id] || ['Premium benefits', 'Reward points', 'Low interest rates'];
  const imageUrl = CARD_IMAGES[card.id] || CARD_IMAGES['1'];

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      toast({ title: 'Please agree', description: 'You must agree to Terms & Conditions to proceed.', variant: 'destructive' });
      return;
    }
    setLoading(true);

    try {
      toast({ title: 'Application Submitted!', description: `Lead created for ${card.name}. Redirecting to bank...` });

      setTimeout(() => {
        const utmLink = `https://bank.example.com/apply?card=${encodeURIComponent(card.name)}&bank=${encodeURIComponent(card.bank)}&utm_source=fincore&utm_medium=dsa`;
        window.open(utmLink, '_blank');
        navigate('/credit-cards');
      }, 1500);
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/credit-cards')} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-semibold text-foreground truncate">Apply for {card.name}</h1>
        </div>
        <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left — Card Preview */}
            <div className="p-6 md:p-8 flex flex-col">
              <div className="bg-muted/30 rounded-xl p-6 flex items-center justify-center">
                <img src={imageUrl} alt={card.name} className="max-w-[280px] w-full h-auto rounded-lg shadow-elevated" />
              </div>

              <div className="mt-5">
                <p className="text-sm font-semibold text-accent">{card.bank}</p>
                <h2 className="text-xl font-display font-bold text-card-foreground mt-0.5">{card.name}</h2>

                <ul className="mt-4 space-y-2">
                  {features.slice(0, 3).map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right — Application Form */}
            <div className="p-6 md:p-8 border-t lg:border-t-0 lg:border-l border-border">
              <div className="text-center mb-6">
                <h2 className="text-xl font-display font-bold text-card-foreground">
                  Apply for {card.bank} - {card.name}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">Fill in your details to proceed</p>
              </div>

              <form onSubmit={handleApply} className="space-y-5">
                <div>
                  <Label className="text-sm font-semibold">Full Name <span className="text-destructive">*</span></Label>
                  <Input
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter your full name"
                    required
                    className="mt-1.5 h-12"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Mobile Number <span className="text-destructive">*</span></Label>
                  <Input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="Enter 10-digit mobile number"
                    required
                    className="mt-1.5 h-12"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Email Address <span className="text-destructive">*</span></Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter your email address"
                    required
                    className="mt-1.5 h-12"
                  />
                </div>

                <div className="flex items-start gap-2.5 pt-2">
                  <Checkbox
                    id="terms"
                    checked={agreed}
                    onCheckedChange={(v) => setAgreed(v === true)}
                    className="mt-0.5"
                  />
                  <label htmlFor="terms" className="text-sm text-muted-foreground leading-snug cursor-pointer">
                    I agree to the{' '}
                    <span className="text-accent font-medium hover:underline">Terms & Conditions</span>
                    {' '}and{' '}
                    <span className="text-accent font-medium hover:underline">Privacy Policy</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-accent text-accent-foreground border-0 h-12 text-sm font-semibold"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                    <><ExternalLink className="w-4 h-4 mr-2" /> Submit Application</>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default CardDetail;
