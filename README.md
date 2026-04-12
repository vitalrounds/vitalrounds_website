# Vital Rounds Website

Official website codebase for Vital Rounds - a platform supporting international
medical graduates with structured observerships and local clinical readiness in Australia.

## Tech Stack

- Next.js (App Router, TypeScript)
- Tailwind CSS
- Supabase

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` from `.env.example` and add your keys:

```bash
cp .env.example .env.local
```

3. Start development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_PROJECT_ID`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Deployment

Recommended deployment target is Vercel, with domain DNS managed in CrazyDomains.
