--00003_skills_taxonomy.sql
-- Seed skills taxonomy
insert into skills (canonical_name, category, aliases)
values
-- Programming Languages
('Python', 'Programming Language', ARRAY['py']),
('JavaScript', 'Programming Language', ARRAY['js']),
('TypeScript', 'Programming Language', ARRAY['ts']),
('Java', 'Programming Language', ARRAY[]::text[]),
('C++', 'Programming Language', ARRAY[]::text[]),

-- Databases
('PostgreSQL', 'Database', ARRAY['postgres', 'postgresql db']),
('MySQL', 'Database', ARRAY[]::text[]),
('MongoDB', 'Database', ARRAY['mongo']),

-- Frontend
('React', 'Frontend Framework', ARRAY['react.js', 'reactjs']),
('Next.js', 'Frontend Framework', ARRAY['nextjs']),
('Vue.js', 'Frontend Framework', ARRAY['vue']),

-- Backend
('Node.js', 'Backend Framework', ARRAY['node']),
('Express', 'Backend Framework', ARRAY[]::text[]),
('Django', 'Backend Framework', ARRAY[]::text[]),
('Flask', 'Backend Framework', ARRAY[]::text[]),

-- DevOps / Cloud
('Docker', 'DevOps / Infrastructure', ARRAY[]::text[]),
('Kubernetes', 'DevOps / Infrastructure', ARRAY['k8s']),
('AWS', 'Cloud Platform', ARRAY['amazon web services']),
('GCP', 'Cloud Platform', ARRAY['google cloud']),
('Azure', 'Cloud Platform', ARRAY[]::text[]),

-- Data / AI
('Machine Learning', 'Machine Learning / AI', ARRAY['ml']),
('Deep Learning', 'Machine Learning / AI', ARRAY['dl']),
('TensorFlow', 'Machine Learning / AI', ARRAY[]::text[]),
('PyTorch', 'Machine Learning / AI', ARRAY[]::text[]),
('SQL', 'Database', ARRAY[]::text[]);

-- ================================================================
-- DEMO DATA
-- Two demo users, one resume, one job, and linking skill rows
-- so the matching RPCs return results without LLM ingestion.
-- ================================================================

-- Fixed UUIDs for reproducibility
-- HR  user:  d0d0d0d0-d0d0-4000-a000-000000000001
-- EMP user:  d0d0d0d0-d0d0-4000-a000-000000000002
-- Resume:    d0d0d0d0-d0d0-4000-a000-000000000010
-- Job:       d0d0d0d0-d0d0-4000-a000-000000000020

-- ── 1. Auth users ────────────────────────────────────────────────
-- The on_auth_user_created trigger auto-inserts matching profiles.

INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES
(
  '00000000-0000-0000-0000-000000000000',
  'd0d0d0d0-d0d0-4000-a000-000000000001',
  'authenticated', 'authenticated',
  'hr@demo.talentlens.ai',
  crypt('demo-hr-2024', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"hr","full_name":"Jordan Rivera"}',
  now(), now(), '', '', '', ''
),
(
  '00000000-0000-0000-0000-000000000000',
  'd0d0d0d0-d0d0-4000-a000-000000000002',
  'authenticated', 'authenticated',
  'employee@demo.talentlens.ai',
  crypt('demo-emp-2024', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"role":"employee","full_name":"Alex Chen"}',
  now(), now(), '', '', '', ''
);

-- Auth identities (required for email/password login)
INSERT INTO auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) VALUES
(
  'd0d0d0d0-d0d0-4000-a000-000000000001',
  'd0d0d0d0-d0d0-4000-a000-000000000001',
  'hr@demo.talentlens.ai',
  jsonb_build_object('sub','d0d0d0d0-d0d0-4000-a000-000000000001','email','hr@demo.talentlens.ai'),
  'email', now(), now(), now()
),
(
  'd0d0d0d0-d0d0-4000-a000-000000000002',
  'd0d0d0d0-d0d0-4000-a000-000000000002',
  'employee@demo.talentlens.ai',
  jsonb_build_object('sub','d0d0d0d0-d0d0-4000-a000-000000000002','email','employee@demo.talentlens.ai'),
  'email', now(), now(), now()
);

-- ── 2. Demo resume (employee, status = ready) ───────────────────

INSERT INTO resumes (id, user_id, raw_text, parsed, status) VALUES (
  'd0d0d0d0-d0d0-4000-a000-000000000010',
  'd0d0d0d0-d0d0-4000-a000-000000000002',
  E'Alex Chen — Full-Stack Engineer\n\nExperience:\n- 4 years TypeScript & React (advanced)\n- 2 years Next.js (intermediate)\n- 3 years PostgreSQL (intermediate)\n- 2 years Python scripting & automation\n\nEducation: BSc Computer Science, 2020',
  '{
    "full_name": "Alex Chen",
    "email": "employee@demo.talentlens.ai",
    "skills": [
      {"name":"TypeScript","proficiency":"advanced","years_experience":4,"confidence":0.95},
      {"name":"React","proficiency":"advanced","years_experience":4,"confidence":0.95},
      {"name":"Next.js","proficiency":"intermediate","years_experience":2,"confidence":0.90},
      {"name":"PostgreSQL","proficiency":"intermediate","years_experience":3,"confidence":0.85},
      {"name":"Python","proficiency":"intermediate","years_experience":2,"confidence":0.80}
    ]
  }',
  'ready'
);

-- ── 3. Resume skills (5 entries) ─────────────────────────────────

INSERT INTO resume_skills (resume_id, skill_id, proficiency, years_experience, source, confidence) VALUES
('d0d0d0d0-d0d0-4000-a000-000000000010', (SELECT id FROM skills WHERE canonical_name='TypeScript'),  'advanced',     4.0, 'extracted', 0.95),
('d0d0d0d0-d0d0-4000-a000-000000000010', (SELECT id FROM skills WHERE canonical_name='React'),       'advanced',     4.0, 'extracted', 0.95),
('d0d0d0d0-d0d0-4000-a000-000000000010', (SELECT id FROM skills WHERE canonical_name='Next.js'),     'intermediate', 2.0, 'extracted', 0.90),
('d0d0d0d0-d0d0-4000-a000-000000000010', (SELECT id FROM skills WHERE canonical_name='PostgreSQL'),  'intermediate', 3.0, 'extracted', 0.85),
('d0d0d0d0-d0d0-4000-a000-000000000010', (SELECT id FROM skills WHERE canonical_name='Python'),      'intermediate', 2.0, 'extracted', 0.80);

-- ── 4. Demo job (HR user, status = ready, active) ───────────────

INSERT INTO jobs (id, created_by, title, company, location, seniority, raw_text, parsed, status, is_active) VALUES (
  'd0d0d0d0-d0d0-4000-a000-000000000020',
  'd0d0d0d0-d0d0-4000-a000-000000000001',
  'Senior Full-Stack Engineer',
  'TalentLens AI',
  'Remote',
  'senior',
  E'Senior Full-Stack Engineer — TalentLens AI (Remote)\n\nRequirements:\n- 3+ years TypeScript (required)\n- 3+ years React (required)\n- 1+ year Next.js (required)\n- 2+ years PostgreSQL (preferred)\n- 1+ year Docker (preferred)',
  '{
    "title": "Senior Full-Stack Engineer",
    "company": "TalentLens AI",
    "location": "Remote",
    "seniority": "senior",
    "skills": [
      {"name":"TypeScript","importance":"required","min_years":3},
      {"name":"React","importance":"required","min_years":3},
      {"name":"Next.js","importance":"required","min_years":1},
      {"name":"PostgreSQL","importance":"preferred","min_years":2},
      {"name":"Docker","importance":"preferred","min_years":1}
    ]
  }',
  'ready',
  true
);

-- ── 5. Job skills (3 required + 2 preferred) ────────────────────

INSERT INTO job_skills (job_id, skill_id, importance, min_years) VALUES
('d0d0d0d0-d0d0-4000-a000-000000000020', (SELECT id FROM skills WHERE canonical_name='TypeScript'),  'required',  3.0),
('d0d0d0d0-d0d0-4000-a000-000000000020', (SELECT id FROM skills WHERE canonical_name='React'),       'required',  3.0),
('d0d0d0d0-d0d0-4000-a000-000000000020', (SELECT id FROM skills WHERE canonical_name='Next.js'),     'required',  1.0),
('d0d0d0d0-d0d0-4000-a000-000000000020', (SELECT id FROM skills WHERE canonical_name='PostgreSQL'),  'preferred', 2.0),
('d0d0d0d0-d0d0-4000-a000-000000000020', (SELECT id FROM skills WHERE canonical_name='Docker'),      'preferred', 1.0);
