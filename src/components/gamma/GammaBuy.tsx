import { useState } from 'react';
import { CreditCard, Check, Zap, Sparkles, AlertCircle } from 'lucide-react';
import { updateUserProfile } from '../../services/firebaseService';

interface BuyProps {
  user: any;
  userProfile: any;
  onPlanUpdate?: () => void;
}

const GammaBuy = ({ user, userProfile, onPlanUpdate }: BuyProps) => {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const plans = [
    {
      id: 'trial',
      name: 'Free Trial',
      price: '₹0',
      credits: 10,
      description: 'Perfect for testing the waters.',
      icon: Sparkles,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/20'
    },
    {
      id: 'basic',
      name: 'Basic Plan',
      price: '₹3,999',
      credits: 1000,
      description: 'Great for small campaigns and starting out.',
      icon: Zap,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
      borderColor: 'border-blue-500/20'
    },
    {
      id: 'silver',
      name: 'Silver Plan',
      price: '₹7,499',
      credits: 2000,
      description: 'Ideal for growing businesses and regular outreach.',
      icon: CreditCard,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20',
      popular: true
    },
    {
      id: 'gold',
      name: 'Gold Plan',
      price: '₹14,999',
      credits: 5000,
      description: 'For high-volume enterprise lead generation.',
      icon: Zap,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/20'
    }
  ];

  const handlePurchase = async (plan: any) => {
    if (!user?.uid) return;
    
    // Simplistic check to prevent trial abuse
    if (plan.id === 'trial' && userProfile?.plan === 'trial' && userProfile?.credits > 0) {
      setError('You are already on an active Free Trial.');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setLoadingPlan(plan.id);
    setError('');
    setSuccess('');

    try {
      // Add purchased credits to existing credits, or set new if none
      const currentCredits = userProfile?.credits || 0;
      const newCredits = plan.id === 'trial' ? plan.credits : currentCredits + plan.credits;
      
      const updateData = {
        plan: plan.id,
        credits: newCredits,
        lastPurchaseDate: new Date().toISOString()
      };

      const result = await updateUserProfile(user.uid, updateData);
      
      if (result.success) {
        setSuccess(`Successfully upgraded to ${plan.name}! Added ${plan.credits} credits.`);
        if (onPlanUpdate) onPlanUpdate();
      } else {
        setError(result.error || 'Upgrade failed. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoadingPlan(null);
      setTimeout(() => setSuccess(''), 5000);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground">
          Purchase credits to power your AI Lead Generation and Campaign Automation.
          Credits are consumed when generating or processing leads.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-3 text-destructive animate-in fade-in slide-in-from-top-4">
          <AlertCircle size={20} className="shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 animate-in fade-in slide-in-from-top-4">
          <Check size={20} className="shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const Icon = plan.icon;
          const isCurrentPlan = userProfile?.plan === plan.id;
          
          return (
            <div 
              key={plan.id}
              className={`
                glass-card flex flex-col relative overflow-hidden transition-all duration-300
                ${plan.popular ? 'border-primary/50 shadow-[0_0_30px_rgba(168,85,247,0.15)] -translate-y-2' : 'hover:-translate-y-1 hover:border-border'}
              `}
            >
              {plan.popular && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#a855f7] to-[#ec4899]" />
              )}
              
              <div className="p-6 flex-1">
                {plan.popular && (
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase mb-4">
                    Most Popular
                  </span>
                )}
                
                <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center ${plan.bgColor} ${plan.color}`}>
                  <Icon size={24} />
                </div>
                
                <h3 className="text-lg font-display font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 h-10">{plan.description}</p>
                
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-3xl font-bold font-display text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/ one-time</span>
                </div>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2">
                    <Check size={16} className={plan.color} />
                    <span className="text-sm font-medium text-foreground">{plan.credits} Credits</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Full Platform Access</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={16} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Priority Support</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6 pt-0 mt-auto">
                <button
                  onClick={() => handlePurchase(plan)}
                  disabled={loadingPlan === plan.id || (isCurrentPlan && plan.id === 'trial')}
                  className={`
                    w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2
                    ${plan.popular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-secondary text-foreground hover:bg-secondary/80'}
                    ${loadingPlan === plan.id ? 'opacity-80 cursor-wait' : ''}
                    ${isCurrentPlan && plan.id === 'trial' ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {loadingPlan === plan.id ? (
                    <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : isCurrentPlan && plan.id === 'trial' ? (
                    'Current Plan'
                  ) : (
                    'Select Plan'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="glass-card p-6 mt-12 bg-secondary/20 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h4 className="font-display font-bold text-foreground mb-1">Current Balance</h4>
          <p className="text-sm text-muted-foreground">Keep track of your active credits.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-6 py-3 rounded-xl bg-background border border-border flex items-center gap-3">
            <Zap size={20} className="text-primary" />
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Credits</p>
              <p className="text-2xl font-display font-bold text-foreground leading-none mt-0.5">
                {userProfile?.credits || 0}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GammaBuy;
