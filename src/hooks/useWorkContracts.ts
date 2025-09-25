import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

export const useWorkContracts = () => {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<WorkContract[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadContracts();
    }
  }, [user]);

  const loadContracts = async () => {
    if (!user) return;

    setIsLoading(true);
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
    } else if (data) {
      setContracts(data as any);
    }
    
    setIsLoading(false);
  };

  return { contracts, isLoading, reloadContracts: loadContracts };
};