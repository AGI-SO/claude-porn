-- Trigger: automatically create profile when user signs up
-- Fires after INSERT on auth.users

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
