import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Star, Crown, Zap, Shield, Heart, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  recommended?: boolean;
  icon: React.ComponentType<{ className?: string }>;
}

const plans: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 9.99,
    interval: 'μήνα',
    icon: Heart,
    features: [
      'Πρόσβαση σε βασικές συνταγές',
      'Συμμετοχή σε events',
      'Βασικό προφίλ',
      'Τμήμα tutorials',
      'Community support'
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    interval: 'μήνα',
    recommended: true,
    icon: Star,
    features: [
      'Όλα τα Basic features',
      'Πρόσβαση σε premium συνταγές',
      'Δημιουργία premium συνταγών',
      'Έσοδα από πώληση συνταγών',
      'Προτεραιότητα σε events',
      'Προχωρημένα tutorials',
      'Verification badge δυνατότητα',
      'Advanced analytics'
    ],
  },
  {
    id: 'pro',
    name: 'Professional',
    price: 39.99,
    interval: 'μήνα',
    icon: Crown,
    features: [
      'Όλα τα Premium features',
      'Οργάνωση δικών σας events',
      'Προσωπικό branding',
      'Άμεση verification διαδικασία',
      'Προτεραιότητα support',
      'Advanced workshop access',
      'Networking με verified chefs',
      'Revenue share program',
      'Custom tutorials creation'
    ],
  },
];

export function Subscriptions() {
  const { user, subscription, refreshSubscription } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: 'Απαιτείται σύνδεση',
        description: 'Παρακαλώ συνδεθείτε για να προχωρήσετε στη συνδρομή.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(planId);

    try {
      // Εδώ θα προστεθεί η λογική για Stripe checkout
      toast({
        title: 'Προς υλοποίηση',
        description: 'Η λειτουργία συνδρομής θα προστεθεί σύντομα με Stripe integration.',
      });
    } catch (error) {
      console.error('Subscription error:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Παρουσιάστηκε σφάλμα κατά τη διαδικασία συνδρομής.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleManageSubscription = async () => {
    try {
      // Εδώ θα προστεθεί η λογική για customer portal
      toast({
        title: 'Προς υλοποίηση',
        description: 'Η διαχείριση συνδρομής θα προστεθεί σύντομα.',
      });
    } catch (error) {
      console.error('Manage subscription error:', error);
      toast({
        title: 'Σφάλμα',
        description: 'Δεν μπόρεσε να ανοίξει η σελίδα διαχείρισης συνδρομής.',
        variant: 'destructive',
      });
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscription?.subscription_tier === planId;
  };

  const getSubscriptionStatus = () => {
    if (!subscription?.subscribed) return null;

    const endDate = subscription.subscription_end 
      ? new Date(subscription.subscription_end).toLocaleDateString('el-GR')
      : 'Μη διαθέσιμη';

    return {
      tier: subscription.subscription_tier,
      endDate
    };
  };

  const status = getSubscriptionStatus();

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Επιλέξτε το πλάνο σας</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Ξεκλειδώστε προχωρημένες δυνατότητες και συμμετέχετε στη κοινότητα των επαγγελματιών μαγείρων
        </p>
      </div>

      {status && (
        <Card className="max-w-md mx-auto border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <CardTitle className="text-green-800 dark:text-green-200">
                Ενεργή Συνδρομή
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">
                <span className="font-medium">Πλάνο:</span> {status.tier?.toUpperCase()}
              </p>
              <p className="text-sm">
                <span className="font-medium">Λήγει:</span> {status.endDate}
              </p>
            </div>
            <Button 
              onClick={handleManageSubscription}
              variant="outline" 
              size="sm" 
              className="mt-4 w-full"
            >
              Διαχείριση Συνδρομής
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const IconComponent = plan.icon;
          const isCurrent = isCurrentPlan(plan.id);
          const isLoading = loading === plan.id;
          
          return (
            <Card 
              key={plan.id} 
              className={`relative overflow-hidden ${
                plan.recommended 
                  ? 'border-primary ring-2 ring-primary/20' 
                  : ''
              } ${isCurrent ? 'border-green-500 bg-green-50 dark:bg-green-950' : ''}`}
            >
              {plan.recommended && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                  Προτεινόμενο
                </div>
              )}
              
              <CardHeader className={`pb-6 ${plan.recommended ? 'pt-8' : ''}`}>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <IconComponent className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="flex items-baseline space-x-1">
                      <span className="text-3xl font-bold">€{plan.price}</span>
                      <span className="text-muted-foreground">/{plan.interval}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={isCurrent || isLoading}
                  className="w-full"
                  variant={isCurrent ? "outline" : "default"}
                  size="lg"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Φόρτωση...</span>
                    </div>
                  ) : isCurrent ? (
                    "Τρέχον πλάνο"
                  ) : (
                    `Επιλογή ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Γιατί να επιλέξετε συνδρομή;</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Zap className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Αποκλειστικό περιεχόμενο</h4>
                    <p className="text-sm text-muted-foreground">
                      Πρόσβαση σε premium συνταγές και προχωρημένα tutorials από verified chefs
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Crown className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Δικτύωση & Επαγγελματική ανάπτυξη</h4>
                    <p className="text-sm text-muted-foreground">
                      Συνδεθείτε με έμπειρους μάγειρες και αναπτύξτε την καριέρα σας
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Heart className="h-5 w-5 text-red-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Κέρδη από τη δημιουργικότητά σας</h4>
                    <p className="text-sm text-muted-foreground">
                      Πουλήστε τις δικές σας συνταγές και εκμεταλλευτείτε την εμπειρία σας
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Star className="h-5 w-5 text-yellow-500 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold">Verification & Αναγνώριση</h4>
                    <p className="text-sm text-muted-foreground">
                      Αποκτήστε verified badge και αναγνώριση στην κοινότητα
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}