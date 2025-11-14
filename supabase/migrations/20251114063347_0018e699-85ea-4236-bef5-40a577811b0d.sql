-- First, deactivate older duplicate contracts (keep only the newest one per user/employer)
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id, employer_id ORDER BY created_at DESC) as rn
  FROM work_contracts
  WHERE is_active = true
)
UPDATE work_contracts
SET is_active = false
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Now add unique partial index to prevent multiple active contracts with same employer per user
CREATE UNIQUE INDEX IF NOT EXISTS unique_active_contract_per_employer
ON work_contracts (user_id, employer_id)
WHERE is_active = true;