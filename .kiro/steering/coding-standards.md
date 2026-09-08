---
inclusion: always
---

# Coding Standards

## Every function must have
JSDoc with @param and @returns tags. Explicit return types.
No inferred return types anywhere.

## Module file structure (api side)
Each module folder must contain exactly:
- router.ts       Express routes
- service.ts      Business logic (pure, no DB calls)
- repository.ts   SQLite queries
- types.ts        TypeScript interfaces
- <module>.test.ts  Co-located Vitest tests

## API contract
All route handlers return: { data: T, error: string | null }
Never return a raw object or send HTTP 200 with an error body.
