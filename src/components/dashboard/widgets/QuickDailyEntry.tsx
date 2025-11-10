import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Plus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useWorkContracts } from '@/hooks/useWorkContracts';
import { useTodayEntry } from '@/hooks/useTodayEntry';
import { calculateDailyWage, saveWorkEntry, updateMonthlySummary } from '@/services/workEntryService';

const QuickDailyEntry: React.FC = () => {
  const { user } = useAuth();
  const { contracts } = useWorkContracts();
  const { hasTodayEntry, checkTodayEntry, today } = useTodayEntry();
  const [selectedContract, setSelectedContract] = useState<string>(contracts[0]?.id || '');
  const [isLoading, setIsLoading] = useState(false);

  React.useEffect(() => {
    if (contracts.length > 0 && !selectedContract) {
      setSelectedContract(contracts[0].id);
    }
  }, [contracts]);

  const saveQuickEntry = async (hours: number, overtimeHours: number = 0) => {
    if (!user || !selectedContract) return;

    setIsLoading(true);
    const contract = contracts.find(c => c.id === selectedContract);
    if (!contract) return;

    const dailyWage = calculateDailyWage(contract, hours, overtimeHours);
    const notes = overtimeHours > 0 
      ? `Γρήγορη καταχώρηση: ${hours}ώρες + ${overtimeHours}ώρες υπερωρία` 
      : `Γρήγορη καταχώρηση: ${hours}ώρες`;

    const { error } = await saveWorkEntry(
      user.id,
      selectedContract,
      today,
      hours,
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
    await checkTodayEntry();
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
        {hasTodayEntry ? (
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
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="default"
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => saveQuickEntry(8, 0)}
                disabled={isLoading}
              >
                <Clock className="h-5 w-5 mb-1" />
                <span className="text-base font-bold">8ωρο</span>
                <span className="text-xs opacity-80">Κανονικό</span>
              </Button>
              <Button
                variant="secondary"
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => saveQuickEntry(8, 2)}
                disabled={isLoading}
              >
                <Plus className="h-5 w-5 mb-1" />
                <span className="text-base font-bold">8ωρο + 2h</span>
                <span className="text-xs opacity-80">Υπερωρίες</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => saveQuickEntry(10, 2)}
                disabled={isLoading}
              >
                <Plus className="h-5 w-5 mb-1" />
                <span className="text-base font-bold">10ωρο + 2h</span>
                <span className="text-xs opacity-80">Πλήρες</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center"
                onClick={() => saveQuickEntry(12, 4)}
                disabled={isLoading}
              >
                <Plus className="h-5 w-5 mb-1" />
                <span className="text-base font-bold">12ωρο + 4h</span>
                <span className="text-xs opacity-80">Μεγάλη</span>
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