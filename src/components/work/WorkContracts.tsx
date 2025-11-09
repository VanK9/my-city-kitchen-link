import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, FileText, Edit, Trash2, Euro, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const contractSchema = z.object({
  employer_id: z.string().min(1, 'Επιλέξτε εργοδότη'),
  contract_type: z.enum(['hourly', 'daily', 'monthly']),
  base_amount: z.number().min(0.01, 'Το ποσό πρέπει να είναι θετικό'),
  overtime_rate: z.number().min(1, 'Ο συντελεστής υπερωρίας πρέπει να είναι τουλάχιστον 1'),
  night_rate: z.number().min(1, 'Ο συντελεστής νυχτερινής απασχόλησης πρέπει να είναι τουλάχιστον 1'),
  holiday_bonus: z.boolean(),
  christmas_bonus: z.boolean(),
  easter_bonus: z.boolean(),
  vacation_bonus: z.boolean(),
  children_allowance: z.number().min(0).optional(),
  hazard_pay: z.number().min(0).optional(),
  transport_allowance: z.number().min(0).optional(),
  meal_allowance: z.number().min(0).optional(),
  other_allowances: z.number().min(0).optional(),
  start_date: z.string().min(1, 'Η ημερομηνία έναρξης είναι υποχρεωτική'),
  end_date: z.string().optional(),
  is_active: z.boolean(),
  notes: z.string().optional(),
});

type ContractFormData = z.infer<typeof contractSchema>;

export const WorkContracts: React.FC = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [employers, setEmployers] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<ContractFormData>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      employer_id: '',
      contract_type: 'monthly',
      base_amount: 0,
      overtime_rate: 1.5,
      night_rate: 1.25,
      holiday_bonus: false,
      christmas_bonus: false,
      easter_bonus: false,
      vacation_bonus: false,
      children_allowance: 0,
      hazard_pay: 0,
      transport_allowance: 0,
      meal_allowance: 0,
      other_allowances: 0,
      start_date: '',
      end_date: '',
      is_active: true,
      notes: '',
    },
  });

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const [contractsResponse, employersResponse] = await Promise.all([
        supabase
          .from('work_contracts')
          .select('*, employers(employer_name, company_name)')
          .order('created_at', { ascending: false }),
        supabase
          .from('employers')
          .select('id, employer_name, company_name')
          .order('employer_name')
      ]);

      if (contractsResponse.error) throw contractsResponse.error;
      if (employersResponse.error) throw employersResponse.error;

      setContracts(contractsResponse.data || []);
      setEmployers(employersResponse.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Σφάλμα κατά τη φόρτωση δεδομένων');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: ContractFormData) => {
    if (!user) return;

    setSaving(true);
    try {
      const contractData = {
        employer_id: data.employer_id,
        contract_type: data.contract_type,
        base_amount: Number(data.base_amount),
        overtime_rate: Number(data.overtime_rate),
        night_rate: Number(data.night_rate),
        holiday_bonus: data.holiday_bonus,
        christmas_bonus: data.christmas_bonus,
        easter_bonus: data.easter_bonus,
        vacation_bonus: data.vacation_bonus,
        children_allowance: Number(data.children_allowance) || 0,
        hazard_pay: Number(data.hazard_pay) || 0,
        transport_allowance: Number(data.transport_allowance) || 0,
        meal_allowance: Number(data.meal_allowance) || 0,
        other_allowances: Number(data.other_allowances) || 0,
        start_date: data.start_date,
        end_date: data.end_date || null,
        is_active: data.is_active,
        notes: data.notes || null,
        user_id: user.id,
      };

      if (editingContract) {
        const { error } = await supabase
          .from('work_contracts')
          .update(contractData)
          .eq('id', editingContract.id);

        if (error) throw error;
        toast.success('Η σύμβαση ενημερώθηκε επιτυχώς');
      } else {
        const { error } = await supabase
          .from('work_contracts')
          .insert(contractData);

        if (error) throw error;
        toast.success('Η σύμβαση προστέθηκε επιτυχώς');
      }

      loadData();
      setIsDialogOpen(false);
      setEditingContract(null);
      form.reset();
    } catch (error) {
      console.error('Error saving contract:', error);
      toast.error('Σφάλμα κατά την αποθήκευση');
    } finally {
      setSaving(false);
    }
  };

  const getContractTypeLabel = (type: string) => {
    switch (type) {
      case 'hourly': return 'Ωρομίσθιος';
      case 'daily': return 'Ημερομίσθιος';
      case 'monthly': return 'Μηνιαίος';
      default: return type;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Πρέπει να συνδεθείτε για να διαχειριστείτε συμβάσεις</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Συμβάσεις Εργασίας
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Νέα Σύμβαση
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContract ? 'Επεξεργασία Σύμβασης' : 'Νέα Σύμβαση Εργασίας'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="employer_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Εργοδότης *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Επιλέξτε εργοδότη" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {employers.map((employer) => (
                            <SelectItem key={employer.id} value={employer.id}>
                              {employer.employer_name} {employer.company_name && `(${employer.company_name})`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contract_type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Τύπος Απασχόλησης *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="hourly">Ωρομίσθιος</SelectItem>
                            <SelectItem value="daily">Ημερομίσθιος</SelectItem>
                            <SelectItem value="monthly">Μηνιαίος Μισθός</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="base_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Βασική Αμοιβή (€) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="π.χ. 850.00"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="overtime_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Συντελεστής Υπερωριών</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="1.5"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="night_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Συντελεστής Νυχτερινής</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="1.25"
                            {...field}
                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ημερομηνία Έναρξης *</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="end_date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ημερομηνία Λήξης (προαιρετικό)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-medium">Δώρα & Επιδόματα</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="holiday_bonus"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                          <FormLabel className="cursor-pointer">Δώρο Αργιών</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="christmas_bonus"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                          <FormLabel className="cursor-pointer">Δώρο Χριστουγέννων</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="easter_bonus"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                          <FormLabel className="cursor-pointer">Δώρο Πάσχα</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="vacation_bonus"
                      render={({ field }) => (
                        <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                          <FormLabel className="cursor-pointer">Επίδομα Αδείας</FormLabel>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-4">
                  <h4 className="text-sm font-medium">Πρόσθετα Επιδόματα (προαιρετικά)</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="children_allowance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Επίδομα Τέκνων (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hazard_pay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Επίδομα Επικινδυνότητας (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="transport_allowance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Επίδομα Μετακίνησης (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="meal_allowance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Επίδομα Σίτισης (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="other_allowances"
                      render={({ field }) => (
                        <FormItem className="col-span-2">
                          <FormLabel>Άλλα Επιδόματα (€)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Σημειώσεις (προαιρετικό)</FormLabel>
                      <FormControl>
                        <Input placeholder="Πρόσθετες πληροφορίες..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_active"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-3 border rounded-lg">
                      <FormLabel className="cursor-pointer">Ενεργή Σύμβαση</FormLabel>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingContract ? 'Ενημέρωση' : 'Δημιουργία'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsDialogOpen(false);
                    setEditingContract(null);
                    form.reset();
                  }} disabled={saving}>
                    Ακύρωση
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : contracts.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">Δεν έχετε προσθέσει συμβάσεις ακόμα</p>
            <p className="text-sm text-muted-foreground">Προσθέστε πρώτα έναν εργοδότη από την καρτέλα "Εργοδότες"</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map((contract) => (
              <div
                key={contract.id}
                className={`p-4 border rounded-lg ${contract.is_active ? 'bg-background' : 'bg-muted/30'}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {contract.employers?.employer_name}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <span>{getContractTypeLabel(contract.contract_type)}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Euro className="h-3 w-3" />
                        {contract.base_amount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};