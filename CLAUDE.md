# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `pnpm build` - Builds client, server, and copies assets
- **Development**: `pnpm run dev` - Starts Wrangler dev server with live reload
- **Deploy**: `pnpm deploy` - Deploys to Cloudflare Workers
- **Type checking**: `npx tsc --noEmit` (TypeScript compilation check)

## Architecture

This is a full-stack Cloudflare Workers application using Hono framework with JSX components:

### Build Process
- Client: Bundles `src/client/main.tsx` to `dist/static/client.js` using esbuild with Hono JSX DOM
- Server: Bundles `src/server/index.ts` to `dist/worker.js` for Cloudflare Workers runtime  
- Assets: Copies `public/*` to `dist/static/` for static file serving

### Key Technologies
- **Framework**: Hono (lightweight web framework for Cloudflare Workers)
- **Frontend**: Hono JSX with DOM rendering (not React)
- **Build**: esbuild for bundling both client and server code
- **Runtime**: Cloudflare Workers (ES2022 target)
- **Package Manager**: pnpm

### Project Structure
- `src/server/` - Hono API routes and middleware for Cloudflare Workers
- `src/client/` - JSX components using Hono's JSX DOM implementation
- `src/shared/` - TypeScript types shared between client and server
- `dist/` - Built assets (worker.js and static files)
- `public/` - Static assets copied to dist/static/

### Important Notes
- Uses Hono JSX, not React JSX - imports come from 'hono/jsx' and 'hono/jsx/dom'
- Wrangler config specifies no_bundle=true, relying on esbuild for bundling
- Static assets are served from dist/static/ directory
- Worker entry point is dist/worker.js