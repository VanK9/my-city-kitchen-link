-- Enhanced profiles table for verification system
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS verification_type TEXT CHECK (verification_type IN ('peer', 'admin', 'document')),
ADD COLUMN IF NOT EXISTS verification_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS portfolio_url TEXT,
ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS skills TEXT[],
ADD COLUMN IF NOT EXISTS certifications JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS verification_votes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS verification_threshold INTEGER DEFAULT 5;

-- Create peer verifications table
CREATE TABLE IF NOT EXISTS public.peer_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verifier_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  verified_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('skills', 'experience', 'identity')),
  comments TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(verifier_id, verified_user_id, verification_type)
);

-- Enable RLS for peer verifications
ALTER TABLE public.peer_verifications ENABLE ROW LEVEL SECURITY;

-- Policies for peer verifications
CREATE POLICY "Users can view all verifications" 
ON public.peer_verifications 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create verifications for others" 
ON public.peer_verifications 
FOR INSERT 
WITH CHECK (auth.uid() = verifier_id AND auth.uid() != verified_user_id);

CREATE POLICY "Users can delete their own verifications" 
ON public.peer_verifications 
FOR DELETE 
USING (auth.uid() = verifier_id);

-- Create badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL CHECK (badge_type IN ('verified', 'expert', 'mentor', 'contributor', 'pioneer')),
  awarded_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  awarded_by UUID REFERENCES auth.users(id),
  reason TEXT,
  UNIQUE(user_id, badge_type)
);

-- Enable RLS for badges
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Policies for badges
CREATE POLICY "Badges are viewable by everyone" 
ON public.user_badges 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can award badges" 
ON public.user_badges 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM profiles 
  WHERE user_id = auth.uid() 
  AND verification_status = 'verified'
));

-- Function to update verification status based on votes
CREATE OR REPLACE FUNCTION public.update_verification_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if user has enough verification votes
  IF (SELECT COUNT(*) FROM peer_verifications WHERE verified_user_id = NEW.verified_user_id) >= 5 THEN
    UPDATE profiles 
    SET is_verified = true,
        verification_type = 'peer',
        verification_date = now()
    WHERE user_id = NEW.verified_user_id;
    
    -- Award verified badge
    INSERT INTO user_badges (user_id, badge_type, reason)
    VALUES (NEW.verified_user_id, 'verified', 'Peer verification completed')
    ON CONFLICT (user_id, badge_type) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-verification
CREATE TRIGGER on_peer_verification_added
AFTER INSERT ON public.peer_verifications
FOR EACH ROW
EXECUTE FUNCTION public.update_verification_status();