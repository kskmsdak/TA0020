# CivicAudit - Blockchain-Based Citizen Auditor Platform

## Overview

CivicAudit is a full-stack civic transparency platform that connects Citizens, Contractors, and Government Admins. It uses AI for report structuring/summarization and a demo blockchain (SHA-256 hash chaining) for report immutability. The platform features role-based dashboards, a public transparency ledger, and a contract marketplace.

Key features:
- **Citizens** submit civic complaints (broken roads, garbage, etc.) and track report status through a pipeline
- **Admins** verify reports, allocate budgets, and assign contractors
- **Contractors** browse and accept government-allocated projects
- **AI-assisted** report generation using OpenAI
- **Blockchain visualization** with SHA-256 hash chaining for immutability
- **Public ledger** for transparent audit trail with integrity verification

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight client-side router)
- **State Management**: TanStack React Query for server state, no separate client state library
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Charts**: Recharts for admin analytics dashboards
- **Animations**: Framer Motion for subtle UI transitions
- **Path aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

The frontend lives in `client/src/` with pages in `pages/`, reusable components in `components/`, hooks in `hooks/`, and utility functions in `lib/`.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript, executed via `tsx` in development
- **API Structure**: RESTful API routes defined in `server/routes.ts`, with shared route definitions and Zod validation schemas in `shared/routes.ts`
- **Authentication**: Replit Auth via OpenID Connect (OIDC) with Passport.js, session storage in PostgreSQL via `connect-pg-simple`
- **Auth middleware**: `isAuthenticated` middleware guards protected routes; auth state exposed at `/api/auth/user`

### Data Storage
- **Database**: PostgreSQL (required, referenced via `DATABASE_URL` environment variable)
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema location**: `shared/schema.ts` (main schema) with related models in `shared/models/`
- **Migrations**: Drizzle Kit with `drizzle-kit push` for schema synchronization (no migration files approach)
- **Key tables**:
  - `users` - Core user table (required for Replit Auth)
  - `sessions` - Session storage (required for Replit Auth)
  - `user_profiles` - Role assignment (citizen/contractor/admin)
  - `reports` - Civic reports with blockchain fields (previousHash, currentHash), AI fields (aiSummary, severityScore), status tracking, contractor assignment, and feedback
  - `conversations` / `messages` - Chat/AI conversation storage

### Shared Code Pattern
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts` - Drizzle table definitions and Zod validation schemas
- `routes.ts` - API route path definitions with input/output Zod schemas
- `models/auth.ts` - User and session table definitions (mandatory for Replit Auth)
- `models/chat.ts` - Conversation and message table definitions

### Build System
- **Development**: Vite dev server with HMR proxied through Express
- **Production build**: Client built with Vite, server bundled with esbuild into `dist/index.cjs`
- Build script in `script/build.ts` selectively bundles server dependencies to optimize cold start

### Replit Integrations
Located in `server/replit_integrations/` and `client/replit_integrations/`:
- **Auth**: Replit OIDC authentication with Passport.js (`auth/`)
- **Chat**: AI chat with OpenAI integration and conversation persistence (`chat/`)
- **Audio**: Voice recording, streaming, and playback utilities (`audio/`)
- **Image**: Image generation via OpenAI's gpt-image-1 model (`image/`)
- **Batch**: Rate-limited batch processing utilities for LLM calls (`batch/`)

### Seeding
`server/seed.ts` creates demo users (citizen@test.com, contractor@test.com, admin@test.com) with profiles and sample reports on startup. It cleans and re-seeds reports each time.

## External Dependencies

### Required Services
- **PostgreSQL**: Primary database, must be provisioned with `DATABASE_URL` environment variable
- **Replit Auth (OIDC)**: Authentication provider using `ISSUER_URL` (defaults to `https://replit.com/oidc`) and `REPL_ID`
- **Session Secret**: `SESSION_SECRET` environment variable required for express-session

### AI/ML Services
- **OpenAI API** (via Replit AI Integrations): Used for report AI summarization, severity scoring, and report generation
  - Configured via `AI_INTEGRATIONS_OPENAI_API_KEY` and `AI_INTEGRATIONS_OPENAI_BASE_URL` environment variables
  - Models used: GPT for text, gpt-image-1 for image generation

### Key NPM Packages
- **Backend**: express, drizzle-orm, passport, openid-client, connect-pg-simple, zod, openai
- **Frontend**: react, wouter, @tanstack/react-query, recharts, framer-motion, react-hook-form, date-fns, shadcn/ui (Radix primitives + Tailwind)
- **Shared**: zod (validation), drizzle-zod (schema-to-zod conversion)