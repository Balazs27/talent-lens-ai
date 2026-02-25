# TalentLens AI — Route Map

## Public Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/login` | Email/password sign-in |
| `/signup` | Registration with role selection (Employee or HR) |
| `/auth/callback` | Supabase OAuth callback |

## Employee Routes

Requires authentication with `role = employee`.
HR users are redirected to `/hr/dashboard`.

| Path | Description |
|------|-------------|
| `/employee/dashboard` | Home — resume count, job matches, skills extracted, next steps |
| `/employee/resume` | Paste resume text for AI skill extraction |
| `/employee/matches` | Browse jobs ranked by skill overlap score |
| `/employee/skills` | View extracted skill profile grouped by category |

## HR Routes

Requires authentication with `role = hr` or `admin`.
Employee users are redirected to `/employee/dashboard`.

| Path | Description |
|------|-------------|
| `/hr/dashboard` | Command center — active jobs, candidate pool, avg match score |
| `/hr/jobs` | List of posted job descriptions with status |
| `/hr/jobs/new` | Create job description via AI requirement extraction |
| `/hr/jobs/[jobId]/candidates` | Candidates matched to a specific job, ranked by score |

## API Routes

All API routes require authentication.

### Ingestion

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/ingest/resume` | employee | Extract skills from resume text |
| POST | `/api/ingest/job` | hr | Extract requirements from job description |

### Matching

| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/match/jobs` | employee | Jobs matching the employee's latest resume |
| GET | `/api/match/candidates` | hr | Candidates matching a given job (`?jobId=`) |

### Analysis

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/analyze/gap` | any auth | Skill gap analysis between a resume and a job |

### Auth

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/api/auth/signout` | any auth | Sign out and redirect to `/login` |
