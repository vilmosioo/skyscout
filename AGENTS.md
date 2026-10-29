# SkyScout Agent Rules & Guidelines

Guidelines and constraints for AI coding assistants working in the SkyScout repository.

## 1. Git Rules (Strict)
- **NEVER** execute `git commit` or commit any changes.
- **NEVER** ask, prompt, or suggest that the user commit changes.
- All git commits are handled manually by the user.

## 2. Monorepo Architecture
- **Workspaces**:
  - `packages/*`: Reusable, publishable TypeScript libraries and API clients.
  - `apps/*`: Web applications and frontends (Vite + React + TypeScript).
- **Orchestration**: Turborepo (`turbo run build`, `turbo run test`, `turbo run typecheck`).
- **Package Builds**: `tsup` targeting dual ESM (`.js`) and CommonJS (`.cjs`) with declaration maps (`.d.ts`).
- **Testing**: Hermetic unit tests using `vitest`.

## 3. Client Package Standards (`packages/*`)
- **Environment Agnostic**: Never sniff `process.env` or `import.meta.env` inside client packages. Tokens and endpoints must be passed explicitly via configuration objects.
- **Zero Heavy Dependencies**: Rely on web-standard `fetch`, `AbortController`, and pure TypeScript types wherever possible.
- **Error Hierarchy**: Provide descriptive error classes (e.g. `AuthError`, `RateLimitError`, `TimeoutError`, `RequestError`).

## 4. Engineering & Communication Style
- **Practicality First**: Focus on features, data visualization, and astronomy workflows. Avoid over-engineering, unnecessary abstractions, or hyper-fixating on micro-optimizations.
- **Conciseness**: Keep explanations direct and avoid unnecessary fluff.
- **Clickable Links**: Reference files and code symbols using GitHub-style markdown links (`file:///...`).
