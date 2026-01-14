-- Trigger: update story score when votes are added/changed/removed
-- Fires after INSERT, UPDATE, DELETE on public.votes

CREATE TRIGGER on_vote_change
  AFTER INSERT OR DELETE OR UPDATE ON public.votes
  FOR EACH ROW
  EXECUTE FUNCTION update_story_score();
