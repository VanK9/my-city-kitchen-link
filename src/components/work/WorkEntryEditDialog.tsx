import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface WorkEntry {
  id: string;
  entry_date: string;
  regular_hours: number;
  overtime_hours: number;
  night_hours?: number;
  holiday_hours?: number;
  daily_wage: number;
  notes?: string;
  contract_id: string;
}

interface WorkEntryEditDialogProps {
  entry: WorkEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const WorkEntryEditDialog: React.FC<WorkEntryEditDialogProps> = ({
  entry,
  open,
  onOpenChange,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    regular_hours: 0,
    overtime_hours: 0,
    night_hours: 0,
    holiday_hours: 0,
    notes: '',
  });

  useEffect(() => {
    if (entry) {
      setFormData({
        regular_hours: entry.regular_hours || 0,
        overtime_hours: entry.overtime_hours || 0,
        night_hours: entry.night_hours || 0,
        holiday_hours: entry.holiday_hours || 0,
        notes: entry.notes || '',
      });
    }
  }, [entry]);

  const handleSave = async () => {
    if (!entry) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('work_entries')
        .update({
          regular_hours: formData.regular_hours,
          overtime_hours: formData.overtime_hours,
          night_hours: formData.night_hours,
          holiday_hours: formData.holiday_hours,
          notes: formData.notes,
          updated_at: new Date().toISOString(),
        })
        .eq('id', entry.id);

      if (error) throw error;

      toast.success('Η καταχώρηση ενημερώθηκε επιτυχώς');
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating entry:', error);
      toast.error('Σφάλμα κατά την ενημέρωση');
    } finally {
      setIsLoading(false);
    }
  };

  if (!entry) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Επεξεργασία Καταχώρησης</DialogTitle>
          <DialogDescription>
            Ημερομηνία: {new Date(entry.entry_date).toLocaleDateString('el-GR')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="regular_hours">Κανονικές Ώρες</Label>
            <Input
              id="regular_hours"
              type="number"
              step="0.5"
              min="0"
              value={formData.regular_hours}
              onChange={(e) =>
                setFormData({ ...formData, regular_hours: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="overtime_hours">Υπερωρίες</Label>
            <Input
              id="overtime_hours"
              type="number"
              step="0.5"
              min="0"
              value={formData.overtime_hours}
              onChange={(e) =>
                setFormData({ ...formData, overtime_hours: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="night_hours">Νυχτερινές Ώρες</Label>
            <Input
              id="night_hours"
              type="number"
              step="0.5"
              min="0"
              value={formData.night_hours}
              onChange={(e) =>
                setFormData({ ...formData, night_hours: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="holiday_hours">Αργίες/Κυριακές</Label>
            <Input
              id="holiday_hours"
              type="number"
              step="0.5"
              min="0"
              value={formData.holiday_hours}
              onChange={(e) =>
                setFormData({ ...formData, holiday_hours: parseFloat(e.target.value) || 0 })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Σημειώσεις</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Προαιρετικές σημειώσεις..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Ακύρωση
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Αποθήκευση
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
