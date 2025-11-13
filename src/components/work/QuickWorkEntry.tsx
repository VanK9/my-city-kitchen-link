import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Clock, Calendar, Save, Calculator, Euro, Loader2, AlertCircle, Edit, Trash2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { el } from 'date-fns/locale';
import { WorkEntryEditDialog } from './WorkEntryEditDialog';

interface WorkContract {
  id: string;
  contract_type: string;
  base_amount: number;
  overtime_rate: number;
  night_rate: number;
  employers: {
    employer_name: string;
    company_name?: string;
  };
}

interface DailyEntry {
  contract_id: string;
  entry_date: string;
  regular_hours: number;
  overtime_hours: number;
  night_hours: number;
  holiday_hours: number;
  notes: string;
}

interface MonthlySummary {
  total_regular_hours: number;
  total_overtime_hours: number;
  total_night_hours: number;
  total_holiday_hours: number;
  base_salary: number;
  overtime_pay: number;
  night_pay: number;
  holiday_pay: number;
  total_salary: number;
}

export const QuickWorkEntry: React.FC = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<WorkContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [entry, setEntry] = useState<DailyEntry>({
    contract_id: '',
    entry_date: format(new Date(), 'yyyy-MM-dd'),
    regular_hours: 8,
    overtime_hours: 0,
    night_hours: 0,
    holiday_hours: 0,
    notes: '',
  });
  const [estimatedPay, setEstimatedPay] = useState<number>(0);
  const [monthlySummary, setMonthlySummary] = useState<MonthlySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingContracts, setLoadingContracts] = useState(true);
  const [monthEntries, setMonthEntries] = useState<any[]>([]);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);

  useEffect(() => {
    if (user) {
      loadContracts();
    }
  }, [user]);

  useEffect(() => {
    if (selectedContract) {
      loadMonthlySummary();
      loadMonthEntries();
      calculateEstimatedPay();
    }
  }, [selectedContract, entry.regular_hours, entry.overtime_hours, entry.night_hours, entry.holiday_hours, selectedDate]);

  const loadContracts = async () => {
    setLoadingContracts(true);
    try {
      const { data, error } = await supabase
        .from('work_contracts')
        .select(`
          id,
          contract_type,
          base_amount,
          overtime_rate,
          night_rate,
          employers (
            employer_name,
            company_name
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const contractsData = data || [];
      setContracts(contractsData as WorkContract[]);
      
      if (contractsData.length > 0 && !selectedContract) {
        setSelectedContract(contractsData[0].id);
      }
    } catch (error) {
      console.error('Error loading contracts:', error);
      toast.error('Σφάλμα κατά τη φόρτωση συμβάσεων');
    } finally {
      setLoadingContracts(false);
    }
  };

  const loadMonthlySummary = async () => {
    if (!selectedContract || !user) return;

    const date = new Date(selectedDate);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    try {
      const { data, error } = await supabase
        .from('monthly_summaries')
        .select('*')
        .eq('contract_id', selectedContract)
        .eq('month', month)
        .eq('year', year)
        .maybeSingle();

      if (error) throw error;
      setMonthlySummary(data);
    } catch (error) {
      console.error('Error loading monthly summary:', error);
    }
  };

  const calculateEstimatedPay = () => {
    const contract = contracts.find(c => c.id === selectedContract);
    if (!contract) return;

    let dailyPay = 0;
    const { base_amount, contract_type, overtime_rate, night_rate } = contract;

    if (contract_type === 'hourly') {
      dailyPay = (entry.regular_hours * base_amount) +
                 (entry.overtime_hours * base_amount * overtime_rate) +
                 (entry.night_hours * base_amount * night_rate) +
                 (entry.holiday_hours * base_amount * 1.75);
    } else if (contract_type === 'daily') {
      dailyPay = base_amount;
      if (entry.overtime_hours > 0) {
        dailyPay += (entry.overtime_hours / 8) * base_amount * overtime_rate;
      }
      if (entry.night_hours > 0) {
        dailyPay += (entry.night_hours / 8) * base_amount * night_rate;
      }
      if (entry.holiday_hours > 0) {
        dailyPay += (entry.holiday_hours / 8) * base_amount * 1.75;
      }
    } else if (contract_type === 'monthly') {
      // For monthly, show daily equivalent
      dailyPay = base_amount / 22; // Assuming 22 working days per month
      if (entry.overtime_hours > 0) {
        const hourlyRate = base_amount / (22 * 8);
        dailyPay += entry.overtime_hours * hourlyRate * overtime_rate;
      }
      if (entry.night_hours > 0) {
        const hourlyRate = base_amount / (22 * 8);
        dailyPay += entry.night_hours * hourlyRate * night_rate;
      }
    }

    setEstimatedPay(Math.round(dailyPay * 100) / 100);
  };

  const handleSaveEntry = async () => {
    if (!user || !selectedContract) return;

    setLoading(true);
    try {
      // Save the daily entry
      const entryData = {
        user_id: user.id,
        contract_id: selectedContract,
        entry_date: selectedDate,
        regular_hours: entry.regular_hours,
        overtime_hours: entry.overtime_hours,
        night_hours: entry.night_hours,
        holiday_hours: entry.holiday_hours,
        daily_wage: estimatedPay,
        notes: entry.notes || null,
      };

      const { error: entryError } = await supabase
        .from('work_entries')
        .upsert(entryData, {
          onConflict: 'user_id,contract_id,entry_date'
        });

      if (entryError) throw entryError;

      // Update monthly summary
      await updateMonthlySummary();

      toast.success('Η καταχώρηση αποθηκεύτηκε επιτυχώς');
      
      // Reset form for next entry
      setEntry({
        contract_id: selectedContract,
        entry_date: format(new Date(), 'yyyy-MM-dd'),
        regular_hours: 8,
        overtime_hours: 0,
        night_hours: 0,
        holiday_hours: 0,
        notes: '',
      });
      
      loadMonthlySummary();
      loadMonthEntries();
    } catch (error) {
      console.error('Error saving entry:', error);
      toast.error('Σφάλμα κατά την αποθήκευση');
    } finally {
      setLoading(false);
    }
  };

  const loadMonthEntries = async () => {
    if (!user || !selectedContract) return;

    const date = new Date(selectedDate);
    const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(date), 'yyyy-MM-dd');

    try {
      const { data, error } = await supabase
        .from('work_entries')
        .select('*')
        .eq('contract_id', selectedContract)
        .gte('entry_date', startDate)
        .lte('entry_date', endDate)
        .order('entry_date', { ascending: false });

      if (error) throw error;
      setMonthEntries(data || []);
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const handleEditEntry = (entry: any) => {
    setEditingEntry(entry);
    setShowEditDialog(true);
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτή την καταχώρηση;')) return;

    try {
      const { error } = await supabase
        .from('work_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      toast.success('Η καταχώρηση διαγράφηκε');
      loadMonthEntries();
      loadMonthlySummary();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast.error('Σφάλμα κατά τη διαγραφή');
    }
  };

  const updateMonthlySummary = async () => {
    if (!user || !selectedContract) return;

    const date = new Date(selectedDate);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(date), 'yyyy-MM-dd');

    try {
      // Get all entries for this month
      const { data: entries, error: entriesError } = await supabase
        .from('work_entries')
        .select('*')
        .eq('contract_id', selectedContract)
        .gte('entry_date', startDate)
        .lte('entry_date', endDate);

      if (entriesError) throw entriesError;

      // Calculate totals
      const totals = entries?.reduce((acc, entry) => ({
        regular_hours: acc.regular_hours + (entry.regular_hours || 0),
        overtime_hours: acc.overtime_hours + (entry.overtime_hours || 0),
        night_hours: acc.night_hours + (entry.night_hours || 0),
        holiday_hours: acc.holiday_hours + (entry.holiday_hours || 0),
        total_wage: acc.total_wage + (entry.daily_wage || 0),
      }), {
        regular_hours: 0,
        overtime_hours: 0,
        night_hours: 0,
        holiday_hours: 0,
        total_wage: 0,
      }) || { regular_hours: 0, overtime_hours: 0, night_hours: 0, holiday_hours: 0, total_wage: 0 };

      const contract = contracts.find(c => c.id === selectedContract);
      if (!contract) return;

      // Calculate detailed pay breakdown
      const { base_amount, contract_type, overtime_rate, night_rate } = contract;
      let baseSalary = 0;
      let overtimePay = 0;
      let nightPay = 0;
      let holidayPay = 0;

      if (contract_type === 'monthly') {
        baseSalary = base_amount;
        const hourlyRate = base_amount / (22 * 8);
        overtimePay = totals.overtime_hours * hourlyRate * overtime_rate;
        nightPay = totals.night_hours * hourlyRate * night_rate;
        holidayPay = totals.holiday_hours * hourlyRate * 1.75;
      } else if (contract_type === 'daily') {
        baseSalary = (totals.regular_hours / 8) * base_amount;
        overtimePay = (totals.overtime_hours / 8) * base_amount * overtime_rate;
        nightPay = (totals.night_hours / 8) * base_amount * night_rate;
        holidayPay = (totals.holiday_hours / 8) * base_amount * 1.75;
      } else { // hourly
        baseSalary = totals.regular_hours * base_amount;
        overtimePay = totals.overtime_hours * base_amount * overtime_rate;
        nightPay = totals.night_hours * base_amount * night_rate;
        holidayPay = totals.holiday_hours * base_amount * 1.75;
      }

      const summaryData = {
        user_id: user.id,
        contract_id: selectedContract,
        month,
        year,
        total_regular_hours: totals.regular_hours,
        total_overtime_hours: totals.overtime_hours,
        total_night_hours: totals.night_hours,
        total_holiday_hours: totals.holiday_hours,
        base_salary: Math.round(baseSalary * 100) / 100,
        overtime_pay: Math.round(overtimePay * 100) / 100,
        night_pay: Math.round(nightPay * 100) / 100,
        holiday_pay: Math.round(holidayPay * 100) / 100,
        bonuses: 0, // To be calculated based on contract settings
        total_salary: Math.round((baseSalary + overtimePay + nightPay + holidayPay) * 100) / 100,
      };

      const { error: summaryError } = await supabase
        .from('monthly_summaries')
        .upsert(summaryData, {
          onConflict: 'user_id,contract_id,month,year'
        });

      if (summaryError) throw summaryError;
    } catch (error) {
      console.error('Error updating monthly summary:', error);
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Πρέπει να συνδεθείτε για να καταχωρήσετε ώρες εργασίας</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Γρήγορη Καταχώρηση Ωρών
          </CardTitle>
          <CardDescription>
            Καταχωρήστε τις ώρες εργασίας σας για σήμερα
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingContracts ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : contracts.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Δεν έχετε ακόμα ενεργές συμβάσεις. Προσθέστε πρώτα έναν εργοδότη και μια σύμβαση από τις αντίστοιχες καρτέλες.
              </AlertDescription>
            </Alert>
          ) : (
            <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Επιλογή Εργοδότη</Label>
              <Select value={selectedContract} onValueChange={setSelectedContract}>
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε σύμβαση" />
                </SelectTrigger>
                <SelectContent>
                  {contracts.map((contract) => (
                    <SelectItem key={contract.id} value={contract.id}>
                      {contract.employers?.employer_name}
                      {contract.employers?.company_name && ` (${contract.employers.company_name})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ημερομηνία</Label>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setEntry({ ...entry, entry_date: e.target.value });
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <Label>Κανονικές Ώρες</Label>
              <Input
                type="number"
                step="0.5"
                value={entry.regular_hours}
                onChange={(e) => setEntry({ ...entry, regular_hours: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Υπερωρίες</Label>
              <Input
                type="number"
                step="0.5"
                value={entry.overtime_hours}
                onChange={(e) => setEntry({ ...entry, overtime_hours: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Νυχτερινές</Label>
              <Input
                type="number"
                step="0.5"
                value={entry.night_hours}
                onChange={(e) => setEntry({ ...entry, night_hours: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>Αργίες</Label>
              <Input
                type="number"
                step="0.5"
                value={entry.holiday_hours}
                onChange={(e) => setEntry({ ...entry, holiday_hours: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <Label>Σημειώσεις</Label>
            <Textarea
              placeholder="Προαιρετικές σημειώσεις..."
              value={entry.notes}
              onChange={(e) => setEntry({ ...entry, notes: e.target.value })}
              rows={3}
            />
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-muted-foreground" />
                <span className="font-medium">Εκτιμώμενη Ημερήσια Αμοιβή:</span>
              </div>
              <div className="flex items-center gap-1 text-2xl font-bold text-primary">
                <Euro className="h-5 w-5" />
                {estimatedPay.toFixed(2)}
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSaveEntry} 
            className="w-full"
            disabled={loading || !selectedContract}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Αποθήκευση...' : 'Αποθήκευση Καταχώρησης'}
          </Button>
            </>
          )}
        </CardContent>
      </Card>

      {monthlySummary && (
        <Card>
          <CardHeader>
            <CardTitle>Μηνιαία Σύνοψη</CardTitle>
            <CardDescription>
              {format(new Date(selectedDate), 'MMMM yyyy', { locale: el })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Σύνολο Ωρών</p>
                <p className="text-xl font-bold">
                  {monthlySummary.total_regular_hours + 
                   monthlySummary.total_overtime_hours + 
                   monthlySummary.total_night_hours + 
                   monthlySummary.total_holiday_hours}
                </p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Υπερωρίες</p>
                <p className="text-xl font-bold">{monthlySummary.total_overtime_hours}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm text-muted-foreground">Σύνολο Μήνα</p>
                <p className="text-xl font-bold text-primary">€{monthlySummary.total_salary.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Month Entries List */}
      {monthEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Καταχωρήσεις Μήνα</CardTitle>
            <CardDescription>
              {format(new Date(selectedDate), 'MMMM yyyy', { locale: el })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {monthEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {format(new Date(entry.entry_date), 'dd/MM/yyyy')}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {entry.regular_hours}ω κανονικές
                      {entry.overtime_hours > 0 && ` + ${entry.overtime_hours}ω υπερωρίες`}
                      {entry.night_hours > 0 && ` + ${entry.night_hours}ω νυχτερινές`}
                    </div>
                    <div className="text-sm font-medium text-primary mt-1">
                      €{entry.daily_wage?.toFixed(2)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditEntry(entry)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEntry(entry.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <WorkEntryEditDialog
        entry={editingEntry}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={() => {
          loadMonthEntries();
          loadMonthlySummary();
        }}
      />
    </div>
  );
};