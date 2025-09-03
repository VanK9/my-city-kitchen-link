import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Plus, Building2, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const employerSchema = z.object({
  employer_name: z.string().min(1, 'Το όνομα εργοδότη είναι υποχρεωτικό'),
  company_name: z.string().optional(),
  tax_id: z.string().optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
});

type EmployerFormData = z.infer<typeof employerSchema>;

interface Employer {
  id: string;
  employer_name: string;
  company_name?: string;
  tax_id?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export const EmployerManagement: React.FC = () => {
  const { user } = useAuth();
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployer, setEditingEmployer] = useState<Employer | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<EmployerFormData>({
    resolver: zodResolver(employerSchema),
    defaultValues: {
      employer_name: '',
      company_name: '',
      tax_id: '',
      address: '',
      phone: '',
      email: '',
    },
  });

  useEffect(() => {
    if (user) {
      loadEmployers();
    }
  }, [user]);

  const loadEmployers = async () => {
    try {
      const { data, error } = await supabase
        .from('employers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmployers(data || []);
    } catch (error) {
      console.error('Error loading employers:', error);
      toast.error('Σφάλμα κατά τη φόρτωση εργοδοτών');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: EmployerFormData) => {
    if (!user) return;

    try {
      if (editingEmployer) {
        const { error } = await supabase
          .from('employers')
          .update(data)
          .eq('id', editingEmployer.id);

        if (error) throw error;
        toast.success('Ο εργοδότης ενημερώθηκε επιτυχώς');
      } else {
        const { error } = await supabase
          .from('employers')
          .insert({ 
            employer_name: data.employer_name,
            company_name: data.company_name || null,
            tax_id: data.tax_id || null,
            address: data.address || null,
            phone: data.phone || null,
            email: data.email || null,
            user_id: user.id 
          });

        if (error) throw error;
        toast.success('Ο εργοδότης προστέθηκε επιτυχώς');
      }

      loadEmployers();
      setIsDialogOpen(false);
      setEditingEmployer(null);
      form.reset();
    } catch (error) {
      console.error('Error saving employer:', error);
      toast.error('Σφάλμα κατά την αποθήκευση');
    }
  };

  const handleEdit = (employer: Employer) => {
    setEditingEmployer(employer);
    form.reset({
      employer_name: employer.employer_name,
      company_name: employer.company_name || '',
      tax_id: employer.tax_id || '',
      address: employer.address || '',
      phone: employer.phone || '',
      email: employer.email || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Είστε σίγουροι ότι θέλετε να διαγράψετε αυτόν τον εργοδότη;')) return;

    try {
      const { error } = await supabase
        .from('employers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Ο εργοδότης διαγράφηκε επιτυχώς');
      loadEmployers();
    } catch (error) {
      console.error('Error deleting employer:', error);
      toast.error('Σφάλμα κατά τη διαγραφή');
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingEmployer(null);
    form.reset();
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Πρέπει να συνδεθείτε για να διαχειριστείτε εργοδότες</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Διαχείριση Εργοδοτών
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Προσθήκη Εργοδότη
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEmployer ? 'Επεξεργασία Εργοδότη' : 'Νέος Εργοδότης'}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="employer_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Όνομα Εργοδότη *</FormLabel>
                      <FormControl>
                        <Input placeholder="π.χ. Ιωάννης Παπαδόπουλος" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="company_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Επωνυμία Εταιρείας</FormLabel>
                      <FormControl>
                        <Input placeholder="π.χ. ABC ΕΠΕ" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tax_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ΑΦΜ</FormLabel>
                      <FormControl>
                        <Input placeholder="π.χ. 123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Διεύθυνση</FormLabel>
                      <FormControl>
                        <Input placeholder="π.χ. Οδός Αθηνάς 1, Αθήνα" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Τηλέφωνο</FormLabel>
                      <FormControl>
                        <Input placeholder="π.χ. 2101234567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="π.χ. info@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2 pt-4">
                  <Button type="submit" className="flex-1">
                    {editingEmployer ? 'Ενημέρωση' : 'Προσθήκη'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
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
          <p className="text-muted-foreground">Φόρτωση...</p>
        ) : employers.length === 0 ? (
          <p className="text-muted-foreground">Δεν έχετε προσθέσει εργοδότες ακόμα</p>
        ) : (
          <div className="space-y-3">
            {employers.map((employer) => (
              <div
                key={employer.id}
                className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{employer.employer_name}</h4>
                    {employer.company_name && (
                      <p className="text-sm text-muted-foreground">{employer.company_name}</p>
                    )}
                    {employer.tax_id && (
                      <p className="text-sm text-muted-foreground">ΑΦΜ: {employer.tax_id}</p>
                    )}
                    {employer.phone && (
                      <p className="text-sm text-muted-foreground">Τηλ: {employer.phone}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(employer)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(employer.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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