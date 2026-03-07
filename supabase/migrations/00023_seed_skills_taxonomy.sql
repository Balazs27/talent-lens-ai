-- 00023_seed_skills_taxonomy.sql
-- Seed the skills table with common tech skills and their known aliases.
-- Uses ON CONFLICT to safely merge with any skills already auto-created.
-- Existing rows get their aliases array updated (merged, not replaced).

-- Helper: merge two TEXT[] arrays, deduplicated, case-preserving
CREATE OR REPLACE FUNCTION _merge_aliases(existing TEXT[], incoming TEXT[])
RETURNS TEXT[]
LANGUAGE sql IMMUTABLE
AS $$
  SELECT COALESCE(
    array_agg(DISTINCT val ORDER BY val),
    ARRAY[]::TEXT[]
  )
  FROM unnest(
    array_cat(COALESCE(existing, ARRAY[]::TEXT[]), COALESCE(incoming, ARRAY[]::TEXT[]))
  ) AS val;
$$;

-- Upsert seed data: on conflict, merge aliases into existing row
INSERT INTO skills (canonical_name, category, aliases) VALUES
  -- Programming Languages
  ('Python',          'programming_language', ARRAY['python3', 'Python3', 'Python 3']),
  ('JavaScript',      'programming_language', ARRAY['JS', 'js', 'Javascript', 'ECMAScript', 'ES6', 'ES2015']),
  ('TypeScript',      'programming_language', ARRAY['TS', 'ts', 'Typescript']),
  ('Java',            'programming_language', ARRAY['java8', 'Java 8', 'Java 11', 'Java 17', 'JDK']),
  ('C#',              'programming_language', ARRAY['CSharp', 'C Sharp', 'csharp', 'dotnet', '.NET C#']),
  ('C++',             'programming_language', ARRAY['CPP', 'cpp', 'C Plus Plus']),
  ('C',               'programming_language', ARRAY[]::TEXT[]),
  ('Go',              'programming_language', ARRAY['Golang', 'golang', 'Go lang']),
  ('Rust',            'programming_language', ARRAY['rust-lang', 'Rust lang']),
  ('Ruby',            'programming_language', ARRAY[]::TEXT[]),
  ('PHP',             'programming_language', ARRAY['php', 'PHP8']),
  ('Swift',           'programming_language', ARRAY['swift', 'Swift UI', 'SwiftUI']),
  ('Kotlin',          'programming_language', ARRAY['kotlin', 'KotlinJVM']),
  ('Scala',           'programming_language', ARRAY['scala']),
  ('R',               'programming_language', ARRAY['R language', 'R programming', 'R lang']),
  ('Bash',            'programming_language', ARRAY['Shell', 'Shell Scripting', 'Bash Scripting', 'sh', 'Zsh', 'shell scripting']),
  ('SQL',             'programming_language', ARRAY['sql', 'Structured Query Language']),
  ('Dart',            'programming_language', ARRAY['dart']),
  ('Elixir',          'programming_language', ARRAY['elixir']),
  ('Haskell',         'programming_language', ARRAY['haskell']),
  ('Lua',             'programming_language', ARRAY['lua']),
  ('Perl',            'programming_language', ARRAY['perl']),
  ('MATLAB',          'programming_language', ARRAY['Matlab', 'matlab']),

  -- Frontend Frameworks & Libraries
  ('React',           'frontend', ARRAY['React.js', 'ReactJS', 'React JS', 'react.js', 'reactjs']),
  ('Angular',         'frontend', ARRAY['Angular.js', 'AngularJS', 'Angular JS', 'angular', 'Angular 2+', 'Angular2']),
  ('Vue.js',          'frontend', ARRAY['Vue', 'VueJS', 'Vue JS', 'vue', 'vuejs', 'Vue 3', 'Vue.js 3']),
  ('Next.js',         'frontend', ARRAY['NextJS', 'Next JS', 'Next', 'nextjs', 'next.js']),
  ('Svelte',          'frontend', ARRAY['svelte', 'SvelteKit', 'Svelte Kit']),
  ('jQuery',          'frontend', ARRAY['JQuery', 'jquery', 'jQuery UI']),
  ('Redux',           'frontend', ARRAY['redux', 'Redux Toolkit', 'RTK']),
  ('Tailwind CSS',    'frontend', ARRAY['Tailwind', 'tailwind', 'TailwindCSS', 'tailwindcss']),
  ('Bootstrap',       'frontend', ARRAY['bootstrap', 'Bootstrap 5', 'Bootstrap CSS']),
  ('CSS',             'frontend', ARRAY['css', 'CSS3', 'css3', 'Cascading Style Sheets']),
  ('HTML',            'frontend', ARRAY['html', 'HTML5', 'html5', 'HyperText Markup Language']),
  ('Sass',            'frontend', ARRAY['SCSS', 'scss', 'sass']),
  ('Webpack',         'frontend', ARRAY['webpack']),
  ('Vite',            'frontend', ARRAY['vite', 'ViteJS']),
  ('Storybook',       'frontend', ARRAY['storybook']),

  -- Backend Frameworks & Libraries
  ('Node.js',         'backend', ARRAY['NodeJS', 'Node JS', 'Node', 'node', 'nodejs', 'node.js']),
  ('Express.js',      'backend', ARRAY['Express', 'ExpressJS', 'express', 'express.js']),
  ('Django',          'backend', ARRAY['django', 'Django REST', 'Django REST Framework', 'DRF']),
  ('Flask',           'backend', ARRAY['flask']),
  ('FastAPI',         'backend', ARRAY['fastapi', 'Fast API']),
  ('Spring Boot',     'backend', ARRAY['Spring', 'SpringBoot', 'spring boot', 'Spring Framework', 'spring']),
  ('Ruby on Rails',   'backend', ARRAY['Rails', 'rails', 'RoR', 'Ruby Rails']),
  ('ASP.NET',         'backend', ARRAY['ASP.NET Core', 'aspnet', 'asp.net', '.NET', 'dotnet', '.NET Core', 'DotNet']),
  ('GraphQL',         'backend', ARRAY['graphql', 'Graph QL']),
  ('REST',            'backend', ARRAY['REST API', 'RESTful', 'REST APIs', 'RESTful API', 'RESTful APIs', 'rest api']),
  ('gRPC',            'backend', ARRAY['grpc', 'GRPC']),
  ('NestJS',          'backend', ARRAY['Nest.js', 'nestjs', 'Nest JS']),

  -- Databases
  ('PostgreSQL',      'database', ARRAY['Postgres', 'postgres', 'psql', 'PSQL', 'PostgresSQL', 'pg']),
  ('MySQL',           'database', ARRAY['mysql', 'MariaDB', 'mariadb']),
  ('MongoDB',         'database', ARRAY['Mongo', 'mongo', 'mongodb', 'Mongo DB']),
  ('Redis',           'database', ARRAY['redis']),
  ('Elasticsearch',   'database', ARRAY['ElasticSearch', 'Elastic Search', 'elastic', 'ES', 'ELK']),
  ('SQLite',          'database', ARRAY['sqlite', 'sqlite3']),
  ('Oracle',          'database', ARRAY['Oracle DB', 'OracleDB', 'Oracle Database']),
  ('SQL Server',      'database', ARRAY['MSSQL', 'MS SQL', 'Microsoft SQL Server', 'SQL Server 2019']),
  ('DynamoDB',        'database', ARRAY['dynamodb', 'Dynamo DB', 'Amazon DynamoDB', 'AWS DynamoDB']),
  ('Cassandra',       'database', ARRAY['cassandra', 'Apache Cassandra']),
  ('Neo4j',           'database', ARRAY['neo4j']),
  ('Supabase',        'database', ARRAY['supabase']),
  ('Firebase',        'database', ARRAY['firebase', 'Google Firebase', 'Firestore']),

  -- Cloud & Infrastructure
  ('AWS',             'cloud', ARRAY['Amazon Web Services', 'Amazon AWS', 'aws', 'Amazon Cloud']),
  ('Azure',           'cloud', ARRAY['Microsoft Azure', 'Azure Cloud', 'azure', 'MS Azure']),
  ('Google Cloud',    'cloud', ARRAY['GCP', 'gcp', 'Google Cloud Platform', 'Google Cloud Services']),
  ('Docker',          'cloud', ARRAY['docker', 'Docker Engine', 'Docker CE']),
  ('Kubernetes',      'cloud', ARRAY['K8s', 'k8s', 'kubernetes', 'K8S', 'Kube']),
  ('Terraform',       'cloud', ARRAY['terraform', 'HashiCorp Terraform', 'TF']),
  ('Ansible',         'cloud', ARRAY['ansible']),
  ('Jenkins',         'cloud', ARRAY['jenkins', 'Jenkins CI']),
  ('Linux',           'cloud', ARRAY['linux', 'Ubuntu', 'CentOS', 'Debian', 'RHEL', 'Red Hat']),
  ('Nginx',           'cloud', ARRAY['nginx', 'NGINX']),
  ('Apache',          'cloud', ARRAY['apache', 'Apache HTTP', 'httpd']),
  ('Serverless',      'cloud', ARRAY['serverless', 'AWS Lambda', 'Lambda', 'Cloud Functions']),
  ('Cloudflare',      'cloud', ARRAY['cloudflare', 'Cloudflare Workers']),
  ('Vercel',          'cloud', ARRAY['vercel']),
  ('Heroku',          'cloud', ARRAY['heroku']),
  ('DigitalOcean',    'cloud', ARRAY['Digital Ocean', 'digitalocean']),

  -- DevOps & CI/CD
  ('CI/CD',           'devops', ARRAY['CICD', 'CI CD', 'Continuous Integration', 'Continuous Deployment', 'Continuous Delivery', 'CI', 'CD']),
  ('Git',             'devops', ARRAY['git', 'Git SCM', 'Version Control']),
  ('GitHub',          'devops', ARRAY['github', 'GitHub Actions', 'Github']),
  ('GitLab',          'devops', ARRAY['gitlab', 'GitLab CI', 'GitLab CI/CD']),
  ('Bitbucket',       'devops', ARRAY['bitbucket']),
  ('CircleCI',        'devops', ARRAY['Circle CI', 'circleci']),
  ('GitHub Actions',  'devops', ARRAY['GH Actions', 'Github Actions', 'github actions']),
  ('ArgoCD',          'devops', ARRAY['Argo CD', 'argocd', 'Argo']),
  ('Prometheus',      'devops', ARRAY['prometheus']),
  ('Grafana',         'devops', ARRAY['grafana']),
  ('DataDog',         'devops', ARRAY['Datadog', 'datadog', 'DD']),
  ('New Relic',       'devops', ARRAY['NewRelic', 'newrelic', 'New relic']),

  -- Data & ML
  ('Pandas',          'data', ARRAY['pandas']),
  ('NumPy',           'data', ARRAY['numpy', 'Numpy']),
  ('Scikit-learn',    'data', ARRAY['sklearn', 'scikit-learn', 'Scikit Learn', 'scikit learn']),
  ('TensorFlow',      'data', ARRAY['tensorflow', 'Tensor Flow', 'TF']),
  ('PyTorch',         'data', ARRAY['pytorch', 'Py Torch']),
  ('Spark',           'data', ARRAY['Apache Spark', 'PySpark', 'pyspark', 'spark']),
  ('Hadoop',          'data', ARRAY['hadoop', 'Apache Hadoop', 'HDFS']),
  ('Kafka',           'data', ARRAY['Apache Kafka', 'kafka']),
  ('Airflow',         'data', ARRAY['Apache Airflow', 'airflow']),
  ('dbt',             'data', ARRAY['DBT', 'data build tool', 'dbt Core', 'dbt Cloud']),
  ('Snowflake',       'data', ARRAY['snowflake']),
  ('BigQuery',        'data', ARRAY['Google BigQuery', 'bigquery', 'Big Query']),
  ('Redshift',        'data', ARRAY['Amazon Redshift', 'AWS Redshift', 'redshift']),
  ('Tableau',         'data', ARRAY['tableau']),
  ('Power BI',        'data', ARRAY['PowerBI', 'powerbi', 'Power Bi', 'Microsoft Power BI']),
  ('Looker',          'data', ARRAY['looker', 'Google Looker']),
  ('ETL',             'data', ARRAY['etl', 'Extract Transform Load']),
  ('Data Modeling',   'data', ARRAY['data modeling', 'Data Modelling', 'data modelling']),
  ('Data Warehousing','data', ARRAY['data warehousing', 'Data Warehouse', 'DWH']),
  ('Machine Learning','data', ARRAY['ML', 'ml', 'machine learning']),
  ('Deep Learning',   'data', ARRAY['deep learning', 'DL']),
  ('NLP',             'data', ARRAY['Natural Language Processing', 'nlp', 'natural language processing']),
  ('Computer Vision', 'data', ARRAY['computer vision', 'CV', 'Image Recognition']),
  ('LLM',             'data', ARRAY['Large Language Model', 'Large Language Models', 'llm', 'LLMs']),
  ('RAG',             'data', ARRAY['Retrieval Augmented Generation', 'rag']),
  ('Langchain',       'data', ARRAY['LangChain', 'langchain']),

  -- Testing
  ('Jest',            'testing', ARRAY['jest']),
  ('Cypress',         'testing', ARRAY['cypress', 'Cypress.io']),
  ('Playwright',      'testing', ARRAY['playwright']),
  ('Selenium',        'testing', ARRAY['selenium', 'Selenium WebDriver']),
  ('Pytest',          'testing', ARRAY['pytest', 'py.test']),
  ('JUnit',           'testing', ARRAY['junit', 'JUnit 5']),
  ('Mocha',           'testing', ARRAY['mocha']),
  ('Testing Library', 'testing', ARRAY['React Testing Library', 'RTL', 'testing-library']),
  ('Unit Testing',    'testing', ARRAY['unit testing', 'Unit Tests', 'unit tests']),
  ('Integration Testing', 'testing', ARRAY['integration testing', 'Integration Tests']),
  ('E2E Testing',     'testing', ARRAY['End-to-End Testing', 'end-to-end testing', 'E2E', 'e2e']),
  ('TDD',             'testing', ARRAY['Test Driven Development', 'test driven development', 'Test-Driven Development']),

  -- Mobile
  ('React Native',    'mobile', ARRAY['react native', 'ReactNative', 'RN']),
  ('Flutter',         'mobile', ARRAY['flutter']),
  ('iOS',             'mobile', ARRAY['ios', 'iOS Development', 'Apple iOS']),
  ('Android',         'mobile', ARRAY['android', 'Android Development']),
  ('Expo',            'mobile', ARRAY['expo']),

  -- Security
  ('OAuth',           'security', ARRAY['OAuth2', 'OAuth 2.0', 'oauth', 'OAuth2.0']),
  ('JWT',             'security', ARRAY['JSON Web Token', 'JSON Web Tokens', 'jwt']),
  ('OWASP',           'security', ARRAY['owasp', 'OWASP Top 10']),
  ('SSL/TLS',         'security', ARRAY['SSL', 'TLS', 'HTTPS', 'ssl', 'tls']),
  ('Encryption',      'security', ARRAY['encryption', 'AES', 'RSA']),
  ('Cybersecurity',   'security', ARRAY['Cyber Security', 'cybersecurity', 'Information Security', 'InfoSec']),

  -- Architecture & Methodology
  ('Microservices',   'architecture', ARRAY['microservices', 'Micro Services', 'Microservice Architecture']),
  ('Agile',           'methodology', ARRAY['agile', 'Agile Methodology', 'Agile Development']),
  ('Scrum',           'methodology', ARRAY['scrum', 'Scrum Master']),
  ('Kanban',          'methodology', ARRAY['kanban']),
  ('Design Patterns', 'architecture', ARRAY['design patterns', 'Software Design Patterns', 'OOP Design Patterns']),
  ('System Design',   'architecture', ARRAY['system design', 'Systems Design', 'Architecture Design']),
  ('Event-Driven Architecture', 'architecture', ARRAY['EDA', 'Event Driven', 'event-driven', 'Event Sourcing']),
  ('Domain-Driven Design', 'architecture', ARRAY['DDD', 'ddd', 'Domain Driven Design']),

  -- Soft Skills
  ('Communication',   'soft_skill', ARRAY['communication', 'Communication Skills', 'Verbal Communication', 'Written Communication']),
  ('Leadership',      'soft_skill', ARRAY['leadership', 'Team Leadership', 'Technical Leadership', 'Tech Lead']),
  ('Problem Solving', 'soft_skill', ARRAY['problem solving', 'Problem-Solving', 'Analytical Thinking', 'Critical Thinking']),
  ('Teamwork',        'soft_skill', ARRAY['teamwork', 'Team Collaboration', 'Collaboration', 'collaboration']),
  ('Time Management', 'soft_skill', ARRAY['time management', 'Prioritization']),
  ('Mentoring',       'soft_skill', ARRAY['mentoring', 'Coaching', 'coaching', 'Mentorship']),
  ('Project Management', 'soft_skill', ARRAY['project management', 'PM', 'Program Management']),
  ('Technical Writing', 'soft_skill', ARRAY['technical writing', 'Documentation', 'documentation', 'Tech Writing']),
  ('Stakeholder Management', 'soft_skill', ARRAY['stakeholder management', 'Stakeholder Communication']),
  ('Cross-functional Collaboration', 'soft_skill', ARRAY['cross-functional', 'Cross Functional', 'cross functional collaboration']),

  -- API & Tools
  ('Postman',         'tools', ARRAY['postman']),
  ('Swagger',         'tools', ARRAY['swagger', 'OpenAPI', 'openapi', 'Open API']),
  ('Jira',            'tools', ARRAY['jira', 'JIRA']),
  ('Confluence',      'tools', ARRAY['confluence']),
  ('Slack',           'tools', ARRAY['slack']),
  ('Figma',           'tools', ARRAY['figma']),
  ('VS Code',         'tools', ARRAY['VSCode', 'Visual Studio Code', 'vscode'])

ON CONFLICT (canonical_name) DO UPDATE
  SET aliases  = _merge_aliases(skills.aliases, EXCLUDED.aliases),
      category = EXCLUDED.category;

-- Clean up helper function
DROP FUNCTION IF EXISTS _merge_aliases(TEXT[], TEXT[]);
