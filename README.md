# Hono JSX Workers Static Assets Project

A full-stack application using Cloudflare Workers with Hono framework, JSX client components, and static assets.

## Architecture & Implementation Strategy

### Project Structure
```
src/
├── server/
│   ├── index.ts           # Main Worker entry point
│   ├── routes/            # API routes
│   └── middleware/        # Custom middleware
├── client/
│   ├── components/        # JSX client components
│   └── main.tsx           # Client entry point
├── shared/
│   └── types.ts           # Shared types
dist/                      # Built static assets
public/                    # Additional static files
```
