-- Trigger function: creates a profile when a new user signs up
-- Sanitizes username (removes Discord # suffix, special chars)
-- Handles duplicate usernames by adding numeric suffix

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  raw_username TEXT;
  clean_username TEXT;
  final_username TEXT;
  counter INT := 0;
BEGIN
  -- Get raw username from OAuth metadata
  raw_username := COALESCE(
    NEW.raw_user_meta_data->>'preferred_username',
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'name',
    split_part(NEW.email, '@', 1)
  );

  -- Sanitize username
  -- Remove Discord discriminator (#0000)
  clean_username := split_part(raw_username, '#', 1);
  -- Replace spaces with underscores
  clean_username := replace(clean_username, ' ', '_');
  -- Keep only alphanumeric, underscores, and hyphens
  clean_username := regexp_replace(clean_username, '[^a-zA-Z0-9_-]', '', 'g');
  -- Ensure username is not empty
  IF clean_username = '' OR clean_username IS NULL THEN
    clean_username := 'user_' || substr(gen_random_uuid()::text, 1, 8);
  END IF;

  final_username := clean_username;

  -- Handle duplicates by adding numeric suffix
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    counter := counter + 1;
    final_username := clean_username || '_' || counter;
  END LOOP;

  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  );
  RETURN NEW;
END;
$function$;
