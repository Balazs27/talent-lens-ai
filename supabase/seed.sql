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
