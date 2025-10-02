-- Create event_participants table for tracking participation
CREATE TABLE IF NOT EXISTS public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'waitlist', 'cancelled')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  notes TEXT,
  UNIQUE(event_id, user_id)
);

-- Enable RLS
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view event participants"
ON public.event_participants
FOR SELECT
USING (true);

CREATE POLICY "Users can join events"
ON public.event_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own participation"
ON public.event_participants
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can cancel their own participation"
ON public.event_participants
FOR DELETE
USING (auth.uid() = user_id);

-- Function to update current_participants count
CREATE OR REPLACE FUNCTION public.update_event_participants_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.events
    SET current_participants = (
      SELECT COUNT(*)
      FROM public.event_participants
      WHERE event_id = NEW.event_id AND status = 'confirmed'
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.events
    SET current_participants = (
      SELECT COUNT(*)
      FROM public.event_participants
      WHERE event_id = NEW.event_id AND status = 'confirmed'
    )
    WHERE id = NEW.event_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.events
    SET current_participants = (
      SELECT COUNT(*)
      FROM public.event_participants
      WHERE event_id = OLD.event_id AND status = 'confirmed'
    )
    WHERE id = OLD.event_id;
    RETURN OLD;
  END IF;
END;
$$;

-- Trigger to auto-update participant counts
CREATE TRIGGER update_event_participants_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.event_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_event_participants_count();

-- Create indexes for better performance
CREATE INDEX idx_event_participants_event_id ON public.event_participants(event_id);
CREATE INDEX idx_event_participants_user_id ON public.event_participants(user_id);
CREATE INDEX idx_event_participants_status ON public.event_participants(status);