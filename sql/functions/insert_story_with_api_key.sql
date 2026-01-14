-- Insert a story using an API key (for MCP server)
-- Validates the API key, inserts the story, and auto-upvotes
-- Used by: mcp-server/src/index.ts

CREATE OR REPLACE FUNCTION public.insert_story_with_api_key(api_key text, story_content text)
RETURNS TABLE(story_id uuid, username text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id UUID;
  v_username TEXT;
  v_story_id UUID;
BEGIN
  -- Verify API key
  SELECT ak.user_id, p.username
  INTO v_user_id, v_username
  FROM api_keys ak
  JOIN profiles p ON p.id = ak.user_id
  WHERE ak.key = api_key
    AND ak.revoked = false;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or revoked API key';
  END IF;

  -- Insert the story
  INSERT INTO stories (user_id, content)
  VALUES (v_user_id, story_content)
  RETURNING id INTO v_story_id;

  -- Auto-upvote by author
  INSERT INTO votes (user_id, story_id, vote_type)
  VALUES (v_user_id, v_story_id, 1)
  ON CONFLICT DO NOTHING;

  RETURN QUERY SELECT v_story_id, v_username;
END;
$function$;
