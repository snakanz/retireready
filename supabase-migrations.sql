-- ============================================================
-- RetireReady — Supabase migrations
-- Project: kcndebogwcxexkqeyesl
-- Run these in the Supabase SQL editor (Dashboard → SQL Editor)
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Add income range columns to leads table
--    These store the human-readable label (e.g. "£50,000–£75,000")
--    captured by the funnel's income step.
-- ─────────────────────────────────────────────────────────────
ALTER TABLE leads
  ADD COLUMN IF NOT EXISTS current_income text,
  ADD COLUMN IF NOT EXISTS desired_income text;


-- ─────────────────────────────────────────────────────────────
-- 2. Create advisor_profiles table
--    Links a Supabase auth user to an adviser account.
--    Any auth user with a row here is considered an adviser.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS advisor_profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  full_name  text NOT NULL,
  email      text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE advisor_profiles ENABLE ROW LEVEL SECURITY;

-- Advisors can read their own profile only
CREATE POLICY "advisor_read_own_profile"
  ON advisor_profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());


-- ─────────────────────────────────────────────────────────────
-- 3. RLS policy: authenticated advisors can SELECT all leads
--    Advisors = any auth user who has a row in advisor_profiles.
-- ─────────────────────────────────────────────────────────────

-- First ensure RLS is enabled on leads (it should already be)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Read policy for advisors
CREATE POLICY "advisors_can_select_leads"
  ON leads FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM advisor_profiles WHERE id = auth.uid()
    )
  );

-- Note: the existing anon INSERT policy should already exist.
-- Do NOT drop or alter it — clients submit leads anonymously.


-- ─────────────────────────────────────────────────────────────
-- 4. (Optional) Seed a test advisor account
--    Replace <USER_UUID> with the uuid from auth.users after
--    you create the advisor's account via Supabase Auth
--    (Authentication → Users → Invite User).
-- ─────────────────────────────────────────────────────────────
-- INSERT INTO advisor_profiles (id, full_name, email)
-- VALUES ('<USER_UUID>', 'Your Name', 'advisor@example.com')
-- ON CONFLICT DO NOTHING;
