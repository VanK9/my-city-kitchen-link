-- Create employers table
CREATE TABLE public.employers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employer_name TEXT NOT NULL,
  company_name TEXT,
  tax_id TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work contracts table
CREATE TABLE public.work_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  employer_id UUID NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  contract_type TEXT NOT NULL CHECK (contract_type IN ('hourly', 'daily', 'monthly')),
  base_amount NUMERIC(10, 2) NOT NULL,
  overtime_rate NUMERIC(5, 2) DEFAULT 1.5,
  night_rate NUMERIC(5, 2) DEFAULT 1.25,
  holiday_bonus BOOLEAN DEFAULT false,
  christmas_bonus BOOLEAN DEFAULT false,
  easter_bonus BOOLEAN DEFAULT false,
  vacation_bonus BOOLEAN DEFAULT false,
  start_date DATE NOT NULL,
  end_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create work entries table
CREATE TABLE public.work_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contract_id UUID NOT NULL REFERENCES public.work_contracts(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  regular_hours NUMERIC(5, 2) DEFAULT 0,
  overtime_hours NUMERIC(5, 2) DEFAULT 0,
  night_hours NUMERIC(5, 2) DEFAULT 0,
  holiday_hours NUMERIC(5, 2) DEFAULT 0,
  daily_wage NUMERIC(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create monthly summaries table
CREATE TABLE public.monthly_summaries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  contract_id UUID NOT NULL REFERENCES public.work_contracts(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  total_regular_hours NUMERIC(10, 2) DEFAULT 0,
  total_overtime_hours NUMERIC(10, 2) DEFAULT 0,
  total_night_hours NUMERIC(10, 2) DEFAULT 0,
  total_holiday_hours NUMERIC(10, 2) DEFAULT 0,
  base_salary NUMERIC(10, 2) DEFAULT 0,
  overtime_pay NUMERIC(10, 2) DEFAULT 0,
  night_pay NUMERIC(10, 2) DEFAULT 0,
  holiday_pay NUMERIC(10, 2) DEFAULT 0,
  bonuses NUMERIC(10, 2) DEFAULT 0,
  total_salary NUMERIC(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, contract_id, month, year)
);

-- Enable RLS
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_summaries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for employers
CREATE POLICY "Users can view their own employers" 
ON public.employers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own employers" 
ON public.employers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employers" 
ON public.employers 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own employers" 
ON public.employers 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for work contracts
CREATE POLICY "Users can view their own contracts" 
ON public.work_contracts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contracts" 
ON public.work_contracts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts" 
ON public.work_contracts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts" 
ON public.work_contracts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for work entries
CREATE POLICY "Users can view their own entries" 
ON public.work_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries" 
ON public.work_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" 
ON public.work_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" 
ON public.work_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for monthly summaries
CREATE POLICY "Users can view their own summaries" 
ON public.monthly_summaries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own summaries" 
ON public.monthly_summaries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own summaries" 
ON public.monthly_summaries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own summaries" 
ON public.monthly_summaries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create update timestamp triggers
CREATE TRIGGER update_employers_updated_at
BEFORE UPDATE ON public.employers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_contracts_updated_at
BEFORE UPDATE ON public.work_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_work_entries_updated_at
BEFORE UPDATE ON public.work_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_monthly_summaries_updated_at
BEFORE UPDATE ON public.monthly_summaries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();