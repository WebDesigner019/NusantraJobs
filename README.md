# NusantaraJobs

NusantaraJobs is an MVP job-matching and upskilling platform for the Indonesian job market. It helps job seekers upload a CV or enter skills manually, then recommends jobs based on skill overlap and shows which skills match, which skills are missing, and which courses can help close the gap.

Live demo: https://nusantarajobs.mrpresident6919.workers.dev

## Features

- Job seeker and employer account flows with role-based dashboards
- Email/password authentication through Supabase Auth
- CV upload with client-side PDF text extraction using `pdfjs-dist`
- Editable skill extraction results with transparent MVP disclaimer
- Job recommendation ranking based on keyword skill matching
- Job detail pages with matched skills, missing skills, and course recommendations
- Employer job posting flow
- Employer candidate ranking based on required skill overlap
- Indonesian-language UI designed for the local job market

## Tech Stack

- React 19
- TanStack Start and TanStack Router
- Vite
- TypeScript
- Tailwind CSS
- shadcn/Radix UI components
- Supabase Auth and PostgreSQL
- Cloudflare Workers deployment

## Architecture

The application uses Cloudflare Workers for hosting and Supabase for backend services.

```txt
Frontend / SSR: TanStack Start on Cloudflare Workers
Authentication: Supabase Auth
Database: Supabase PostgreSQL
CV Parsing: Client-side PDF text extraction
Matching: MVP keyword overlap scoring
```

The AI-related functionality is intentionally framed as an MVP prototype. Current matching is deterministic keyword matching, with a production migration path toward Azure AI Document Intelligence, Azure AI Search, and Azure OpenAI.

## Database

The Supabase schema includes:

- `profiles`
- `user_roles`
- `seeker_profiles`
- `jobs`

The main NusantaraJobs migration is located in:

```txt
supabase/migrations/20260428181008_267d8676-7e83-4af0-a591-1148cbf08545.sql
```

For a fresh Supabase setup, run the profile migration first, then the NusantaraJobs migration:

```txt
supabase/migrations/20260325045202_1b013cb3-25f9-473f-84dd-79d97f9e3f38.sql
supabase/migrations/20260428181008_267d8676-7e83-4af0-a591-1148cbf08545.sql
```

The older habit tracker migrations are template leftovers and are not required for NusantaraJobs.

## Environment Variables

Create a `.env` file with Supabase project values:

```env
SUPABASE_URL="https://your-project-ref.supabase.co"
SUPABASE_PUBLISHABLE_KEY="your-publishable-key"

VITE_SUPABASE_PROJECT_ID="your-project-ref"
VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="your-publishable-key"
```

Only use Supabase publishable or anon keys in this project. Do not expose a Supabase service role key in the frontend.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:8080
```

Build for production:

```bash
npm run build
```

## Deployment

This project is configured for Cloudflare Workers through `wrangler.jsonc`.

Build the app:

```bash
npm run build
```

Deploy:

```bash
npx wrangler deploy --config dist/server/wrangler.json
```

The deployed Worker is named:

```txt
nusantarajobs
```

## Supabase Auth Setup

In Supabase, configure Authentication URL settings:

```txt
Site URL:
https://nusantarajobs.mrpresident6919.workers.dev

Redirect URLs:
https://nusantarajobs.mrpresident6919.workers.dev/**
http://localhost:8080/**
```

For demo recordings, email confirmation can be disabled temporarily in:

```txt
Authentication -> Providers -> Email -> Confirm email
```

For production, enable email confirmation and configure SMTP.

## MVP Limitations

- CV parsing is keyword-based text extraction, not a full document intelligence pipeline.
- Match scoring is based on required-skill overlap, not semantic search.
- Course recommendations are static mappings.
- The apply flow is intentionally demo-level and not a full messaging/application workflow.
- Google OAuth requires Supabase provider setup with Google Cloud OAuth credentials.

## Submission Notes

NusantaraJobs is built as an honest MVP prototype. It demonstrates a complete end-to-end job matching workflow with real authentication, database persistence, role-based user journeys, and a live Cloudflare deployment.
