import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Calendar, Euro, TrendingUp, ChevronRight, Building2, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface MonthlySummary {
  total_hours: number;
  total_salary: number;
}

const WorkScheduleQuickAccess: React.FC = () => {
  const { user } = useAuth();
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary>({
    total_hours: 0,
    total_salary: 0
  });
  const [activeContracts, setActiveContracts] = useState<number>(0);

  useEffect(() => {
    if (user) {
      loadSummaryData();
    }
  }, [user]);

  const loadSummaryData = async () => {
    if (!user) return;

    try {
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();

      // Load monthly summaries for current month
      const { data: summaries, error: summariesError } = await supabase
        .from('monthly_summaries')
        .select('total_regular_hours, total_overtime_hours, total_night_hours, total_holiday_hours, total_salary')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (summariesError) throw summariesError;

      // Calculate totals
      const totals = summaries?.reduce((acc, summary) => ({
        total_hours: acc.total_hours + 
          (summary.total_regular_hours || 0) + 
          (summary.total_overtime_hours || 0) + 
          (summary.total_night_hours || 0) + 
          (summary.total_holiday_hours || 0),
        total_salary: acc.total_salary + (summary.total_salary || 0)
      }), { total_hours: 0, total_salary: 0 }) || { total_hours: 0, total_salary: 0 };

      setMonthlySummary(totals);

      // Load active contracts count
      const { count, error: contractsError } = await supabase
        .from('work_contracts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (contractsError) throw contractsError;
      setActiveContracts(count || 0);

    } catch (error) {
      console.error('Error loading summary data:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Εργασία
          </span>
          <Link to="/work-schedule">
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Link to="/work-schedule">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Καταχώρηση
            </Button>
          </Link>
          <Link to="/work-schedule">
            <Button variant="outline" className="w-full justify-start" size="sm">
              <Building2 className="h-4 w-4 mr-2" />
              Εργοδότες
            </Button>
          </Link>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Μήνας {format(new Date(), 'MM/yyyy')}</span>
            <span className="font-semibold text-primary">€{monthlySummary.total_salary.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Σύνολο Ωρών</span>
            <span className="font-semibold">{monthlySummary.total_hours.toFixed(1)}h</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Ενεργές Συμβάσεις</span>
            <span className="font-semibold">{activeContracts}</span>
          </div>
        </div>

        <Link to="/work-schedule" className="block">
          <Button className="w-full" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Προβολή Αναλυτικά
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default WorkScheduleQuickAccess;