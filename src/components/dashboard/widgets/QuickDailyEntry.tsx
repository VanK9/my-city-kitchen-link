import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format, subDays } from 'date-fns';
import { useWorkContracts } from '@/hooks/useWorkContracts';
import { calculateDailyWage, saveWorkEntry, updateMonthlySummary } from '@/services/workEntryService';
import { supabase } from '@/integrations/supabase/client';

const QuickDailyEntry: React.FC = () => {
  const { user } = useAuth();
  const { contracts } = useWorkContracts();
  const [selectedContract, setSelectedContract] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const [isLoading, setIsLoading] = useState(false);
  const [extraHours, setExtraHours] = useState<string>('0');
  const [includeNightHours, setIncludeNightHours] = useState(false);
  const [existingEntries, setExistingEntries] = useState<Set<string>>(new Set());

  const dateOptions = [
    { label: 'Σήμερα', date: format(new Date(), 'yyyy-MM-dd') },
    { label: 'Χτες', date: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
    { label: 'Προχτές', date: format(subDays(new Date(), 2), 'yyyy-MM-dd') },
    { label: 'Προπροχτές', date: format(subDays(new Date(), 3), 'yyyy-MM-dd') },
  ];

  useEffect(() => {
    if (contracts.length > 0 && !selectedContract) {
      setSelectedContract(contracts[0].id);
    }
  }, [contracts]);

  useEffect(() => {
    if (user && selectedContract) {
      checkExistingEntries();
    }
  }, [user, selectedContract]);

  const checkExistingEntries = async () => {
    if (!user || !selectedContract) return;

    const dates = dateOptions.map(d => d.date);
    const { data } = await supabase
      .from('work_entries')
      .select('entry_date')
      .eq('user_id', user.id)
      .eq('contract_id', selectedContract)
      .in('entry_date', dates);

    if (data) {
      setExistingEntries(new Set(data.map(entry => entry.entry_date)));
    }
  };

  const saveQuickEntry = async () => {
    if (!user || !selectedContract || existingEntries.has(selectedDate)) return;

    setIsLoading(true);
    const contract = contracts.find(c => c.id === selectedContract);
    if (!contract) {
      setIsLoading(false);
      return;
    }

    const regularHours = 8;
    const overtimeHours = parseFloat(extraHours) || 0;
    const nightHours = includeNightHours ? 8 : 0;

    const dailyWage = calculateDailyWage(contract, regularHours, overtimeHours);
    const notes = `Γρήγορη καταχώρηση: ${regularHours}ώρες${overtimeHours > 0 ? ` + ${overtimeHours}ώρες υπερωρία` : ''}${nightHours > 0 ? ` + ${nightHours}ώρες νυχτερινές` : ''}`;

    const { error } = await saveWorkEntry(
      user.id,
      selectedContract,
      selectedDate,
      regularHours,
      overtimeHours,
      dailyWage,
      notes
    );

    setIsLoading(false);

    if (error) {
      toast.error('Σφάλμα κατά την αποθήκευση');
      return;
    }

    toast.success('Η εργασία καταχωρήθηκε επιτυχώς!');
    setExtraHours('0');
    setIncludeNightHours(false);
    await checkExistingEntries();
    await updateMonthlySummary(user.id, selectedContract);
  };

  if (!user) return null;
  
  if (contracts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Γρήγορη Καταχώρηση
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              Δεν έχετε ακόμα εργοδότες ή συμβάσεις
            </p>
            <p className="text-xs text-muted-foreground">
              Προσθέστε πρώτα έναν εργοδότη από τη σελίδα "Ωρολόγιο Πρόγραμμα"
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Γρήγορη Καταχώρηση
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Επιλογή Σύμβασης */}
          {contracts.length > 1 && (
            <div>
              <Label htmlFor="contract-select" className="text-sm font-medium">Σύμβαση Εργασίας</Label>
              <select
                id="contract-select"
                value={selectedContract}
                onChange={(e) => setSelectedContract(e.target.value)}
                className="w-full mt-1 p-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {contracts.map((contract) => (
                  <option key={contract.id} value={contract.id}>
                    {contract.employers?.employer_name} - {contract.contract_type}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Επιλογή Ημερομηνίας */}
          <div>
            <Label className="text-sm font-medium">Ημερομηνία</Label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {dateOptions.map((option) => {
                const hasEntry = existingEntries.has(option.date);
                return (
                  <Button
                    key={option.date}
                    variant={selectedDate === option.date ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedDate(option.date)}
                    disabled={hasEntry}
                    className="relative"
                  >
                    {hasEntry && (
                      <CheckCircle2 className="h-3 w-3 absolute top-1 right-1" />
                    )}
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* 8ωρο (πάντα επιλεγμένο) */}
          <div className="p-3 border border-input rounded-md bg-muted/50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">8ωρο (Κανονικό)</span>
            </div>
          </div>

          {/* Extra Ώρες */}
          <div>
            <Label htmlFor="extra-hours" className="text-sm font-medium">Extra Ώρες (Υπερωρίες)</Label>
            <Input
              id="extra-hours"
              type="number"
              min="0"
              max="12"
              step="0.5"
              value={extraHours}
              onChange={(e) => setExtraHours(e.target.value)}
              className="mt-1"
              placeholder="0"
            />
          </div>

          {/* Checkbox για Νυχτερινές Ώρες */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="night-hours"
              checked={includeNightHours}
              onCheckedChange={(checked) => setIncludeNightHours(checked as boolean)}
            />
            <Label
              htmlFor="night-hours"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Νυχτερινές Ώρες (8ωρο)
            </Label>
          </div>

          {/* Κουμπί Αποθήκευσης */}
          <Button
            onClick={saveQuickEntry}
            disabled={isLoading || existingEntries.has(selectedDate) || !selectedContract}
            className="w-full"
          >
            {isLoading ? 'Αποθήκευση...' : 'Καταχώρηση'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            {format(new Date(selectedDate), 'dd/MM/yyyy')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickDailyEntry;