-- Utility function to sanitize usernames
-- Removes Discord discriminator, special chars, ensures non-empty

CREATE OR REPLACE FUNCTION public.sanitize_username(raw_username text)
RETURNS text
LANGUAGE plpgsql
AS $function$
DECLARE
  clean_username TEXT;
BEGIN
  -- Remove Discord discriminator (#0000)
  clean_username := split_part(raw_username, '#', 1);
  -- Replace spaces with underscores
  clean_username := replace(clean_username, ' ', '_');
  -- Keep only alphanumeric, underscores, and hyphens
  clean_username := regexp_replace(clean_username, '[^a-zA-Z0-9_-]', '', 'g');
  -- Ensure username is not empty
  IF clean_username = '' THEN
    clean_username := 'user_' || substr(gen_random_uuid()::text, 1, 8);
  END IF;
  RETURN clean_username;
END;
$function$;
