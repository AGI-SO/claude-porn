-- Verify an API key and return user info
-- Returns user_id and username if key is valid and not revoked

CREATE OR REPLACE FUNCTION public.verify_api_key(api_key text)
RETURNS TABLE(user_id uuid, username text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT ak.user_id, p.username
  FROM api_keys ak
  JOIN profiles p ON p.id = ak.user_id
  WHERE ak.key = api_key AND ak.revoked = false;
END;
$function$;
