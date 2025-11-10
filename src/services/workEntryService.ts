import { supabase } from '@/integrations/supabase/client';

interface WorkContract {
  id: string;
  base_amount: number;
  contract_type: string;
  overtime_rate: number;
}

export const calculateDailyWage = (
  contract: WorkContract,
  hours: number,
  overtimeHours: number
): number => {
  let dailyWage = 0;
  
  if (contract.contract_type === 'hourly') {
    dailyWage = (hours * contract.base_amount) + 
                (overtimeHours * contract.base_amount * contract.overtime_rate);
  } else if (contract.contract_type === 'daily') {
    dailyWage = contract.base_amount;
    if (overtimeHours > 0) {
      const hourlyRate = contract.base_amount / 8;
      dailyWage += overtimeHours * hourlyRate * contract.overtime_rate;
    }
  } else if (contract.contract_type === 'monthly') {
    const dailyRate = contract.base_amount / 25;
    dailyWage = dailyRate;
    if (overtimeHours > 0) {
      const hourlyRate = dailyRate / 8;
      dailyWage += overtimeHours * hourlyRate * contract.overtime_rate;
    }
  }
  
  return dailyWage;
};

export const saveWorkEntry = async (
  userId: string,
  contractId: string,
  date: string,
  hours: number,
  overtimeHours: number,
  dailyWage: number,
  notes: string
) => {
  const { error } = await supabase
    .from('work_entries')
    .upsert({
      user_id: userId,
      contract_id: contractId,
      entry_date: date,
      regular_hours: hours,
      overtime_hours: overtimeHours,
      daily_wage: dailyWage,
      notes
    }, {
      onConflict: 'user_id,contract_id,entry_date',
      ignoreDuplicates: false
    });

  return { error };
};

export const updateMonthlySummary = async (
  userId: string,
  contractId: string
) => {
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Get all entries for this month
  const { data: entries, error: entriesError } = await supabase
    .from('work_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('contract_id', contractId)
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
    .eq('user_id', userId)
    .eq('contract_id', contractId)
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
        user_id: userId,
        contract_id: contractId,
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