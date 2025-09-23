import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Plus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface WorkContract {
  id: string;
  employer_id: string;
  base_amount: number;
  contract_type: string;
  overtime_rate: number;
  employers: {
    employer_name: string;
  };
}

const QuickDailyEntry: React.FC = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<WorkContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [todayEntry, setTodayEntry] = useState<boolean>(false);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) {
      loadContracts();
      checkTodayEntry();
    }
  }, [user]);

  const loadContracts = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('work_contracts')
      .select(`
        id,
        employer_id,
        base_amount,
        contract_type,
        overtime_rate,
        employers (
          employer_name
        )
      `)
      .eq('user_id', user.id)
      .eq('is_active', true);

    if (error) {
      console.error('Error loading contracts:', error);
      return;
    }

    if (data && data.length > 0) {
      setContracts(data as any);
      setSelectedContract(data[0].id);
    }
  };

  const checkTodayEntry = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('work_entries')
      .select('id')
      .eq('user_id', user.id)
      .eq('entry_date', today);

    if (!error && data && data.length > 0) {
      setTodayEntry(true);
    }
  };

  const saveQuickEntry = async (hours: number, overtimeHours: number = 0) => {
    if (!user || !selectedContract) return;

    setIsLoading(true);
    const contract = contracts.find(c => c.id === selectedContract);
    if (!contract) return;

    // Calculate daily wage based on contract type
    let dailyWage = 0;
    if (contract.contract_type === 'hourly') {
      dailyWage = (hours * contract.base_amount) + 
                  (overtimeHours * contract.base_amount * contract.overtime_rate);
    } else if (contract.contract_type === 'daily') {
      dailyWage = contract.base_amount;
      if (overtimeHours > 0) {
        // For daily rate, calculate hourly rate (daily/8) for overtime
        const hourlyRate = contract.base_amount / 8;
        dailyWage += overtimeHours * hourlyRate * contract.overtime_rate;
      }
    } else if (contract.contract_type === 'monthly') {
      // For monthly, calculate daily rate (monthly/25 working days)
      const dailyRate = contract.base_amount / 25;
      dailyWage = dailyRate;
      if (overtimeHours > 0) {
        const hourlyRate = dailyRate / 8;
        dailyWage += overtimeHours * hourlyRate * contract.overtime_rate;
      }
    }

    const { error } = await supabase
      .from('work_entries')
      .insert({
        user_id: user.id,
        contract_id: selectedContract,
        entry_date: today,
        regular_hours: hours,
        overtime_hours: overtimeHours,
        daily_wage: dailyWage,
        notes: overtimeHours > 0 ? `Γρήγορη καταχώρηση: ${hours}ώρες + ${overtimeHours}ώρες υπερωρία` : `Γρήγορη καταχώρηση: ${hours}ώρες`
      });

    setIsLoading(false);

    if (error) {
      toast.error('Σφάλμα κατά την αποθήκευση');
      return;
    }

    toast.success('Η εργασία καταχωρήθηκε επιτυχώς!');
    setTodayEntry(true);
    
    // Update monthly summary
    await updateMonthlySummary();
  };

  const updateMonthlySummary = async () => {
    if (!user || !selectedContract) return;

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Get all entries for this month
    const { data: entries, error: entriesError } = await supabase
      .from('work_entries')
      .select('*')
      .eq('user_id', user.id)
      .eq('contract_id', selectedContract)
      .gte('entry_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
      .lte('entry_date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-31`);

    if (entriesError || !entries) return;

    // Calculate totals
    const totals = entries.reduce((acc, entry) => ({
      regular_hours: acc.regular_hours + (entry.regular_hours || 0),
      overtime_hours: acc.overtime_hours + (entry.overtime_hours || 0),
      night_hours: acc.night_hours + (entry.night_hours || 0),
      holiday_hours: acc.holiday_hours + (entry.holiday_hours || 0),
      total_salary: acc.total_salary + (entry.daily_wage || 0)
    }), {
      regular_hours: 0,
      overtime_hours: 0,
      night_hours: 0,
      holiday_hours: 0,
      total_salary: 0
    });

    // Check if summary exists
    const { data: existing } = await supabase
      .from('monthly_summaries')
      .select('id')
      .eq('user_id', user.id)
      .eq('contract_id', selectedContract)
      .eq('month', currentMonth)
      .eq('year', currentYear)
      .single();

    if (existing) {
      // Update existing summary
      await supabase
        .from('monthly_summaries')
        .update({
          total_regular_hours: totals.regular_hours,
          total_overtime_hours: totals.overtime_hours,
          total_night_hours: totals.night_hours,
          total_holiday_hours: totals.holiday_hours,
          total_salary: totals.total_salary
        })
        .eq('id', existing.id);
    } else {
      // Create new summary
      await supabase
        .from('monthly_summaries')
        .insert({
          user_id: user.id,
          contract_id: selectedContract,
          month: currentMonth,
          year: currentYear,
          total_regular_hours: totals.regular_hours,
          total_overtime_hours: totals.overtime_hours,
          total_night_hours: totals.night_hours,
          total_holiday_hours: totals.holiday_hours,
          total_salary: totals.total_salary
        });
    }
  };

  if (!user) return null;
  if (contracts.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Γρήγορη Καταχώρηση
        </CardTitle>
      </CardHeader>
      <CardContent>
        {todayEntry ? (
          <div className="text-center py-4">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Έχετε ήδη καταχωρήσει εργασία για σήμερα
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {contracts.length > 1 && (
              <select
                value={selectedContract}
                onChange={(e) => setSelectedContract(e.target.value)}
                className="w-full p-2 border rounded-md text-sm"
              >
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.employers?.employer_name}
                  </option>
                ))}
              </select>
            )}
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => saveQuickEntry(8)}
                disabled={isLoading}
              >
                <Clock className="h-4 w-4 mr-1" />
                8 ώρες
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => saveQuickEntry(8, 1)}
                disabled={isLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                8ώρες + 1 υπερωρία
              </Button>
            </div>
            
            <p className="text-xs text-center text-muted-foreground">
              {format(new Date(), 'dd/MM/yyyy')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default QuickDailyEntry;