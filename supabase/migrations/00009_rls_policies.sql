--Final Row Level Security Set Up:

  -- ============================================================
  -- 0. SECURITY DEFINER helper (runs as postgres, bypasses RLS)
  -- ============================================================
  CREATE OR REPLACE FUNCTION public.is_hr()
  RETURNS boolean
  LANGUAGE sql
  SECURITY DEFINER
  SET search_path = public
  AS $$
    SELECT EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'hr'
    );
  $$;

  -- ============================================================
  -- 1. PROFILES
  -- ============================================================
  ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS profiles_select_own    ON profiles;
  DROP POLICY IF EXISTS profiles_update_own    ON profiles;
  DROP POLICY IF EXISTS profiles_insert_own    ON profiles;
  DROP POLICY IF EXISTS profiles_hr_select     ON profiles;

  -- Every user can read their own profile
  CREATE POLICY profiles_select_own ON profiles
      FOR SELECT USING (id = auth.uid());

  -- Every user can update their own profile
  CREATE POLICY profiles_update_own ON profiles
      FOR UPDATE USING (id = auth.uid())
      WITH CHECK (id = auth.uid());

  -- Allow insert during signup
  CREATE POLICY profiles_insert_own ON profiles
      FOR INSERT WITH CHECK (id = auth.uid());

  -- HR can read ALL profiles (uses SECURITY DEFINER — no self-reference)
  CREATE POLICY profiles_hr_select ON profiles
      FOR SELECT USING (public.is_hr());

  -- ============================================================
  -- 2. RESUMES
  -- ============================================================
  ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS resumes_employee_all ON resumes;
  DROP POLICY IF EXISTS resumes_hr_select    ON resumes;

  -- Employees: full access to own resumes
  CREATE POLICY resumes_employee_all ON resumes
      FOR ALL USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());

  -- HR: read all resumes
  CREATE POLICY resumes_hr_select ON resumes
      FOR SELECT USING (public.is_hr());

  -- ============================================================
  -- 3. RESUME_SKILLS
  -- ============================================================
  ALTER TABLE resume_skills ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS resume_skills_employee_select ON resume_skills;
  DROP POLICY IF EXISTS resume_skills_employee_insert ON resume_skills;
  DROP POLICY IF EXISTS resume_skills_employee_update ON resume_skills;
  DROP POLICY IF EXISTS resume_skills_employee_delete ON resume_skills;
  DROP POLICY IF EXISTS resume_skills_hr_select       ON resume_skills;

  -- Employee: manage skills for own resumes
  CREATE POLICY resume_skills_employee_select ON resume_skills
      FOR SELECT USING (
          EXISTS (SELECT 1 FROM resumes WHERE id = resume_skills.resume_id AND user_id = auth.uid())
      );

  CREATE POLICY resume_skills_employee_insert ON resume_skills
      FOR INSERT WITH CHECK (
          EXISTS (SELECT 1 FROM resumes WHERE id = resume_skills.resume_id AND user_id = auth.uid())
      );

  CREATE POLICY resume_skills_employee_update ON resume_skills
      FOR UPDATE USING (
          EXISTS (SELECT 1 FROM resumes WHERE id = resume_skills.resume_id AND user_id = auth.uid())
      );

  CREATE POLICY resume_skills_employee_delete ON resume_skills
      FOR DELETE USING (
          EXISTS (SELECT 1 FROM resumes WHERE id = resume_skills.resume_id AND user_id = auth.uid())
      );

  -- HR: read all resume_skills
  CREATE POLICY resume_skills_hr_select ON resume_skills
      FOR SELECT USING (public.is_hr());

  -- ============================================================
  -- 4. JOBS
  -- ============================================================
  ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS jobs_hr_own        ON jobs;
  DROP POLICY IF EXISTS jobs_hr_select_all ON jobs;
  DROP POLICY IF EXISTS jobs_employee_read ON jobs;

  -- HR: full access to own jobs
  CREATE POLICY jobs_hr_own ON jobs
      FOR ALL USING (created_by = auth.uid())
      WITH CHECK (created_by = auth.uid());

  -- HR: read all jobs
  CREATE POLICY jobs_hr_select_all ON jobs
      FOR SELECT USING (public.is_hr());

  -- Employees: read active jobs
  CREATE POLICY jobs_employee_read ON jobs
      FOR SELECT USING (is_active = true);

  -- ============================================================
  -- 5. JOB_SKILLS
  -- ============================================================
  ALTER TABLE job_skills ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS job_skills_hr_manage      ON job_skills;
  DROP POLICY IF EXISTS job_skills_hr_select_all  ON job_skills;
  DROP POLICY IF EXISTS job_skills_employee_select ON job_skills;

  -- HR: manage skills for own jobs
  CREATE POLICY job_skills_hr_manage ON job_skills
      FOR ALL USING (
          EXISTS (SELECT 1 FROM jobs WHERE id = job_skills.job_id AND created_by = auth.uid())
      ) WITH CHECK (
          EXISTS (SELECT 1 FROM jobs WHERE id = job_skills.job_id AND created_by = auth.uid())
      );

  -- HR: read all job_skills
  CREATE POLICY job_skills_hr_select_all ON job_skills
      FOR SELECT USING (public.is_hr());

  -- Employees: read skills for active jobs
  CREATE POLICY job_skills_employee_select ON job_skills
      FOR SELECT USING (
          EXISTS (SELECT 1 FROM jobs WHERE id = job_skills.job_id AND is_active = true)
      );

  -- ============================================================
  -- 6. SKILLS (taxonomy — read-only for all authenticated users)
  -- ============================================================
  ALTER TABLE skills ENABLE ROW LEVEL SECURITY;

  DROP POLICY IF EXISTS skills_select_authenticated ON skills;

  CREATE POLICY skills_select_authenticated ON skills
      FOR SELECT USING (auth.uid() IS NOT NULL);

  -- ============================================================
  -- 7. GAP_ANALYSIS_CACHE
  -- ============================================================
  ALTER TABLE gap_analysis_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY gap_cache_employee_select
ON gap_analysis_cache
FOR SELECT
USING (
    EXISTS (
        SELECT 1
        FROM resumes
        WHERE resumes.id = gap_analysis_cache.resume_id
        AND resumes.user_id = auth.uid()
    )
);

CREATE POLICY gap_cache_hr_select
ON gap_analysis_cache
FOR SELECT
USING (public.is_hr());


--Check if they're all gone:
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename;