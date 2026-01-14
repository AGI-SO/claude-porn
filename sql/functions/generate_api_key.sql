-- Generate a new API key for the authenticated user
-- Returns the full key (only shown once at creation time)
-- Key format: cpk_ + 48 random hex chars

CREATE OR REPLACE FUNCTION public.generate_api_key(key_name text)
RETURNS TABLE(id uuid, key text, name text, created_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_user_id UUID;
  v_key TEXT;
  v_id UUID;
  v_created_at TIMESTAMPTZ;
BEGIN
  -- Get current user
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Generate key: cpk_ + 48 random hex chars
  v_key := 'cpk_' || encode(gen_random_bytes(24), 'hex');

  -- Insert the key
  INSERT INTO api_keys (user_id, key, name, revoked)
  VALUES (v_user_id, v_key, key_name, false)
  RETURNING api_keys.id, api_keys.created_at INTO v_id, v_created_at;

  -- Return the new key (only time the full key is shown)
  RETURN QUERY SELECT v_id, v_key, key_name, v_created_at;
END;
$function$;
