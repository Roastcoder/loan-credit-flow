import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CreditCard, FileText, BarChart3, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRole } from '@/contexts/RoleContext';

const slides = [
  {
    icon: Shield,
    title: 'Welcome to Finonest',
    description: 'Your complete SaaS platform for managing credit cards and loan disbursements with role-based access control.',
    color: 'hsl(168, 60%, 42%)',
  },
  {
    icon: CreditCard,
    title: 'Credit Card Module',
    description: 'Add, manage, and track credit card products. DSA partners can view their commissions per product in real-time.',
    color: 'hsl(205, 80%, 50%)',
  },
  {
    icon: BarChart3,
    title: 'Loan Disbursement',
    description: 'Track all loan categories — car, personal, business, home loans and more. Update statuses and monitor performance with analytics.',
    color: 'hsl(38, 92%, 50%)',
  },
];

const Onboarding = () => {
  const [current, setCurrent] = useState(0);
  const { setHasSeenOnboarding } = useRole();
  const navigate = useNavigate();

  const handleFinish = () => {
    setHasSeenOnboarding(true);
    navigate('/login');
  };

  const slide = slides[current];

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-500"
            style={{ background: `${slide.color}20` }}
          >
            <slide.icon className="w-12 h-12 transition-all duration-500" style={{ color: slide.color }} />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h1 className="text-3xl font-display font-bold text-foreground">{slide.title}</h1>
          <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">{slide.description}</p>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === current ? 'w-8 bg-accent' : 'w-2 bg-border'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          {current < slides.length - 1 ? (
            <>
              <Button
                onClick={() => setCurrent(current + 1)}
                className="w-full gradient-accent text-accent-foreground border-0 h-12 text-sm font-semibold"
              >
                Next <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <button
                onClick={handleFinish}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Skip
              </button>
            </>
          ) : (
            <Button
              onClick={handleFinish}
              className="w-full gradient-accent text-accent-foreground border-0 h-12 text-sm font-semibold"
            >
              Get Started <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
