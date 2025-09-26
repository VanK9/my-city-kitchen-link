import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Euro, Calculator, FileText, Plus, Edit, Building2, Users, ClipboardList, Info, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EmployerManagement } from '@/components/work/EmployerManagement';
import { WorkContracts } from '@/components/work/WorkContracts';
import { QuickWorkEntry } from '@/components/work/QuickWorkEntry';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface WorkScheduleEntry {
  id: string;
  user_id: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  break_minutes?: number;
  work_type: 'regular' | 'overtime' | 'night' | 'holiday';
  hourly_rate: number;
  total_hours?: number;
  gross_pay?: number;
  notes?: string;
  created_at: string;
}

interface PayrollSummary {
  total_hours: number;
  regular_hours: number;
  overtime_hours: number;
  night_hours: number;
  holiday_hours: number;
  base_salary: number;
  overtime_pay: number;
  night_bonus: number;
  holiday_bonus: number;
  christmas_bonus?: number;
  easter_bonus?: number;
  vacation_bonus?: number;
  total_gross: number;
}

const WorkSchedule: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [workEntries, setWorkEntries] = useState<WorkScheduleEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [payrollSummary, setPayrollSummary] = useState<PayrollSummary | null>(null);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [baseSalary, setBaseSalary] = useState<number>(800); // Greek minimum wage
  const [paymentType, setPaymentType] = useState<'monthly' | 'daily'>('monthly');
  const [loading, setLoading] = useState(false);

  // Greek employment law constants
  const GREEK_LAW = {
    STANDARD_HOURS_WEEK: 40,
    MAX_HOURS_5DAY: 45,
    MAX_HOURS_6DAY: 48,
    OVERTIME_RATE_FIRST: 1.20, // +20% for first 5-8 overtime hours
    OVERTIME_RATE_REAL: 1.40,  // +40% for real overtime
    OVERTIME_RATE_ILLEGAL: 2.20, // +120% for illegal overtime
    NIGHT_RATE: 1.25,         // +25% for night work (22:00-06:00)
    HOLIDAY_RATE: 1.75,       // +75% for Sundays/holidays
    CHRISTMAS_BONUS: 1.0,     // 1 month salary or 25 daily wages
    EASTER_BONUS: 0.5,        // 0.5 month salary or 15 daily wages
    VACATION_BONUS: 0.5,      // 0.5 month salary or 13 daily wages
    UNHEALTHY_BONUS: 0.10     // +10% for cooks (unhealthy environment)
  };

  const calculatePayroll = (entries: WorkScheduleEntry[]): PayrollSummary => {
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === selectedMonth && entryDate.getFullYear() === selectedYear;
    });

    let totalHours = 0;
    let regularHours = 0;
    let overtimeHours = 0;
    let nightHours = 0;
    let holidayHours = 0;

    monthEntries.forEach(entry => {
      const hours = entry.total_hours || 0;
      totalHours += hours;

      switch (entry.work_type) {
        case 'regular':
          regularHours += hours;
          break;
        case 'overtime':
          overtimeHours += hours;
          break;
        case 'night':
          nightHours += hours;
          break;
        case 'holiday':
          holidayHours += hours;
          break;
      }
    });

    const hourlyRate = paymentType === 'monthly' ? baseSalary / 176 : baseSalary / 25; // 176 hours/month or 25 days
    
    const basePay = regularHours * hourlyRate;
    const overtimePay = overtimeHours * hourlyRate * GREEK_LAW.OVERTIME_RATE_FIRST;
    const nightBonus = nightHours * hourlyRate * (GREEK_LAW.NIGHT_RATE - 1);
    const holidayBonus = holidayHours * hourlyRate * (GREEK_LAW.HOLIDAY_RATE - 1);
    const unhealthyBonus = basePay * GREEK_LAW.UNHEALTHY_BONUS;

    const totalGross = basePay + overtimePay + nightBonus + holidayBonus + unhealthyBonus;

    return {
      total_hours: totalHours,
      regular_hours: regularHours,
      overtime_hours: overtimeHours,
      night_hours: nightHours,
      holiday_hours: holidayHours,
      base_salary: basePay,
      overtime_pay: overtimePay,
      night_bonus: nightBonus,
      holiday_bonus: holidayBonus,
      total_gross: totalGross
    };
  };

  const loadWorkEntries = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // This would be a real table in production
      // For now, using mock data
      const mockEntries: WorkScheduleEntry[] = [
        {
          id: '1',
          user_id: user.id,
          date: '2024-01-15',
          clock_in: '09:00',
          clock_out: '17:30',
          work_type: 'regular',
          hourly_rate: 4.5,
          total_hours: 8,
          gross_pay: 36,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          user_id: user.id,
          date: '2024-01-16',
          clock_in: '09:00',
          clock_out: '19:00',
          work_type: 'overtime',
          hourly_rate: 4.5,
          total_hours: 9.5,
          gross_pay: 42.75,
          created_at: new Date().toISOString()
        }
      ];

      setWorkEntries(mockEntries);
      const summary = calculatePayroll(mockEntries);
      setPayrollSummary(summary);
    } catch (error) {
      console.error('Error loading work entries:', error);
      toast({
        title: "Σφάλμα",
        description: "Δεν ήταν δυνατή η φόρτωση των δεδομένων εργασίας.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkEntries();
  }, [user, selectedMonth, selectedYear]);

  const months = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος', 'Μάιος', 'Ιούνιος',
    'Ιούλιος', 'Αύγουστος', 'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
  ];

  if (!user) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Απαιτείται Σύνδεση</h3>
        <p className="text-muted-foreground">
          Συνδεθείτε για να δείτε και να διαχειριστείτε το πρόγραμμα εργασίας σας.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Διαχείριση Εργασίας
          </h2>
          <p className="text-muted-foreground">
            Καταγραφή ωρών, εργοδοτών και υπολογισμός αποδοχών σύμφωνα με τον Ελληνικό Νόμο
          </p>
        </div>
      </div>

      {/* Tabs for different work management sections */}
      <Tabs defaultValue="quick-entry" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick-entry">
            <ClipboardList className="h-4 w-4 mr-2" />
            Γρήγορη Καταχώρηση
          </TabsTrigger>
          <TabsTrigger value="employers">
            <Building2 className="h-4 w-4 mr-2" />
            Εργοδότες
          </TabsTrigger>
          <TabsTrigger value="contracts">
            <FileText className="h-4 w-4 mr-2" />
            Συμβάσεις
          </TabsTrigger>
          <TabsTrigger value="history">
            <Calendar className="h-4 w-4 mr-2" />
            Ιστορικό
          </TabsTrigger>
        </TabsList>

        {/* Quick Work Entry Tab */}
        <TabsContent value="quick-entry" className="space-y-4">
          <Alert className="mb-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Καταχωρήστε γρήγορα τις ώρες εργασίας σας. Πρώτα προσθέστε έναν εργοδότη και μια σύμβαση από τις αντίστοιχες καρτέλες.
            </AlertDescription>
          </Alert>
          <QuickWorkEntry />
        </TabsContent>

        {/* Employer Management Tab */}
        <TabsContent value="employers" className="space-y-4">
          <EmployerManagement />
        </TabsContent>

        {/* Work Contracts Tab */}
        <TabsContent value="contracts" className="space-y-4">
          <WorkContracts />
        </TabsContent>

        {/* Work History Tab */}
        <TabsContent value="history" className="space-y-4">
          {/* Month/Year Selector */}
          <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Επιλογή Περιόδου
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="month">Μήνας</Label>
              <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label htmlFor="year">Έτος</Label>
              <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[2024, 2025, 2026].map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Salary Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Euro className="h-5 w-5 mr-2" />
            Ρυθμίσεις Αποδοχών
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="paymentType">Τύπος Πληρωμής</Label>
              <Select value={paymentType} onValueChange={(value: 'monthly' | 'daily') => setPaymentType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Μηνιάτικος Μισθός</SelectItem>
                  <SelectItem value="daily">Ημερομίσθιο</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="baseSalary">
                {paymentType === 'monthly' ? 'Βασικός Μισθός (€/μήνα)' : 'Ημερομίσθιο (€/ημέρα)'}
              </Label>
              <Input
                type="number"
                value={baseSalary}
                onChange={(e) => setBaseSalary(parseFloat(e.target.value) || 0)}
                placeholder={paymentType === 'monthly' ? '800' : '35'}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payroll Summary */}
      {payrollSummary && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calculator className="h-5 w-5 mr-2" />
              Αναφορά Αποδοχών - {months[selectedMonth]} {selectedYear}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Συνολικές Ώρες</h4>
                <p className="text-2xl font-bold">{payrollSummary.total_hours.toFixed(1)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Κανονικές Ώρες</h4>
                <p className="text-2xl font-bold text-green-600">{payrollSummary.regular_hours.toFixed(1)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Υπερωρίες</h4>
                <p className="text-2xl font-bold text-orange-600">{payrollSummary.overtime_hours.toFixed(1)}</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">Συνολικές Αποδοχές</h4>
                <p className="text-2xl font-bold text-primary">€{payrollSummary.total_gross.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span>Βασικές Αποδοχές:</span>
                <span className="font-semibold">€{payrollSummary.base_salary.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Αποζημίωση Υπερωριών (+20%):</span>
                <span className="font-semibold">€{payrollSummary.overtime_pay.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Επίδομα Νυχτερινής (+25%):</span>
                <span className="font-semibold">€{payrollSummary.night_bonus.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Επίδομα Αργιών (+75%):</span>
                <span className="font-semibold">€{payrollSummary.holiday_bonus.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-green-600">
                <span>Επίδομα Ανθυγιεινού (+10%):</span>
                <span className="font-semibold">€{(payrollSummary.base_salary * 0.1).toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center text-lg font-bold">
                <span>Συνολικά Μικτά:</span>
                <span className="text-primary">€{payrollSummary.total_gross.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Entries List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Καταγραφές Εργασίας
          </CardTitle>
          <CardDescription>
            Λίστα καταγραφών για {months[selectedMonth]} {selectedYear}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : workEntries.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Δεν βρέθηκαν καταγραφές για την επιλεγμένη περίοδο.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {workEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="font-semibold">{new Date(entry.date).toLocaleDateString('el-GR')}</p>
                      <p className="text-sm text-muted-foreground">
                        {entry.clock_in} - {entry.clock_out} ({entry.total_hours}h)
                      </p>
                    </div>
                    <Badge variant={
                      entry.work_type === 'regular' ? 'secondary' : 
                      entry.work_type === 'overtime' ? 'destructive' : 'default'
                    }>
                      {entry.work_type === 'regular' ? 'Κανονικό' : 
                       entry.work_type === 'overtime' ? 'Υπερωρία' : 
                       entry.work_type === 'night' ? 'Νυχτερινό' : 'Αργία'}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold">€{entry.gross_pay?.toFixed(2)}</span>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkSchedule;