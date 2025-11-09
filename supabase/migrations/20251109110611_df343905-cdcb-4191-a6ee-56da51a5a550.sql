-- Add optional fields to work_contracts for better salary calculations
ALTER TABLE work_contracts
ADD COLUMN IF NOT EXISTS children_allowance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS hazard_pay numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS transport_allowance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS meal_allowance numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS other_allowances numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS notes text;