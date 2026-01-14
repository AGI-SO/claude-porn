-- Revoke an API key (soft delete)
-- Only the owner can revoke their own keys

CREATE OR REPLACE FUNCTION public.revoke_api_key(key_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Only revoke if key belongs to user
  UPDATE api_keys
  SET revoked = true
  WHERE id = key_id AND user_id = v_user_id;

  RETURN FOUND;
END;
$function$;
