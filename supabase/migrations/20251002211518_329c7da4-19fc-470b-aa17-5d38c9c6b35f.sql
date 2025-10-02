-- Fix search_path for update_event_participants_count function
CREATE OR REPLACE FUNCTION public.update_event_participants_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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