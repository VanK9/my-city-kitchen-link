import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { el } from 'date-fns/locale';

const MonthlyBalanceWidget: React.FC = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: el });

  useEffect(() => {
    if (user) {
      loadMonthlyBalance();
    }
  }, [user]);

  const loadMonthlyBalance = async () => {
    if (!user) return;

    setIsLoading(true);
    const currentMonthNumber = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Get all monthly summaries for the current month
    const { data, error } = await supabase
      .from('monthly_summaries')
      .select('total_salary')
      .eq('user_id', user.id)
      .eq('month', currentMonthNumber)
      .eq('year', currentYear);

    if (!error && data) {
      const total = data.reduce((sum, entry) => sum + (entry.total_salary || 0), 0);
      setBalance(total);
    }
    
    setIsLoading(false);
  };

  if (!user) return null;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Wallet className="h-5 w-5 text-primary" />
          Μηνιαίος Μισθός
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-10 bg-muted animate-pulse rounded" />
            <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  {balance.toFixed(2)}€
                </span>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                <Calendar className="h-3 w-3" />
                <span>{currentMonth}</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground">
                Συνολικός μισθός από όλες τις συμβάσεις για τον τρέχοντα μήνα
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MonthlyBalanceWidget;
