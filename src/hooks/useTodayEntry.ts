import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

export const useTodayEntry = () => {
  const { user } = useAuth();
  const [hasTodayEntry, setHasTodayEntry] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    if (user) {
      checkTodayEntry();
    }
  }, [user]);

  const checkTodayEntry = async () => {
    if (!user) return;

    setIsChecking(true);
    const { data, error } = await supabase
      .from('work_entries')
      .select('id')
      .eq('user_id', user.id)
      .eq('entry_date', today);

    if (!error && data && data.length > 0) {
      setHasTodayEntry(true);
    } else {
      setHasTodayEntry(false);
    }
    
    setIsChecking(false);
  };

  return { hasTodayEntry, isChecking, checkTodayEntry, today };
};