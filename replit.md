# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Social Media Auto-Publishing Platform "ODI Publisher" — allows users to connect social media accounts (Facebook, YouTube, TikTok, Instagram) and auto-publish content across all platforms simultaneously.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, Recharts, Framer Motion, shadcn/ui, Tailwind CSS
- **Auth**: Demo mode + Replit Auth (session-based)

## Features

- Dashboard with analytics charts (views, likes, shares)
- Create posts and publish to multiple platforms simultaneously
- Per-platform caption and hashtag customization
- Post scheduling with date/time picker
- Platform connections (Facebook, YouTube, TikTok, Instagram, Twitter)
- Analytics overview with line charts and platform breakdown
- User profile (display name: "ODI BEST ETT")
- Demo mode (full app without real login)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── social-publisher/   # React + Vite frontend (at /)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- `users` — user accounts
- `profiles` — user profiles (display name, bio, website, avatar)
- `platform_connections` — connected social media accounts
- `posts` — created content with platform targets, captions, scheduling

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## API Routes

- `GET /api/healthz` — Health check
- `GET /api/auth/me` — Get current user (401 if unauthenticated)
- `GET/PUT /api/profile` — User profile
- `GET/POST /api/platforms` — List/connect platforms
- `DELETE /api/platforms/:id` — Disconnect platform
- `GET/POST /api/posts` — List/create posts
- `GET/PUT/DELETE /api/posts/:id` — Post CRUD
- `POST /api/posts/:id/publish` — Publish post to all connected platforms
- `GET /api/analytics` — Analytics overview (period: 7d/30d/90d)
- `GET /api/analytics/posts` — Per-post analytics

## Demo Mode

The app runs in demo mode without real OAuth. Clicking "Continue in Demo Mode" on the login page gives full access with seeded data (4 platform connections, 4 sample posts).
