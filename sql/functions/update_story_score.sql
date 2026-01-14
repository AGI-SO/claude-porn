-- Trigger function: recalculates story score when votes change
-- Called on INSERT, UPDATE, DELETE on votes table

CREATE OR REPLACE FUNCTION public.update_story_score()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  target_story_id UUID;
BEGIN
  -- Get the story_id depending on operation
  IF TG_OP = 'DELETE' THEN
    target_story_id := OLD.story_id;
  ELSE
    target_story_id := NEW.story_id;
  END IF;

  -- Recalculate score from all votes
  UPDATE stories
  SET score = COALESCE((
    SELECT SUM(vote_type)
    FROM votes
    WHERE story_id = target_story_id
  ), 0)
  WHERE id = target_story_id;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;
