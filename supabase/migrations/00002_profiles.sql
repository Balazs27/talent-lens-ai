-- 00002_profiles.sql
-- User profiles with role (employee/hr/admin)

CREATE TYPE user_role AS ENUM ('employee', 'hr', 'admin');

CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role user_role NOT NULL DEFAULT 'employee',
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    org_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY profiles_select_own ON profiles
    FOR SELECT USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY profiles_update_own ON profiles
    FOR UPDATE USING (id = auth.uid());

-- Allow insert during signup (the trigger runs as postgres, but this covers direct inserts)
CREATE POLICY profiles_insert_own ON profiles
    FOR INSERT WITH CHECK (id = auth.uid());

-- Auto-create a profile row when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, role, full_name, email)
    VALUES (
        NEW.id,
        COALESCE(
            (NEW.raw_user_meta_data ->> 'role')::public.user_role,
            'employee'::public.user_role
        ),
        COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
        COALESCE(NEW.email, '')
    );
    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
