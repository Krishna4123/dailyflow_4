---
name: scaffold-module
description: Scaffold a complete CRUD module (router, service, repository, types, and tests) for a new domain entity in the DailyFlow API, following the project's steering-file conventions.
---

# Scaffold Module

Use this skill to scaffold a new backend module for DailyFlow.

The user provides two values after the slash command, in this order:
1. MODULE_NAME — lowercase, plural folder name (e.g. "tasks")
2. ENTITY_NAME — PascalCase singular type name (e.g. "Task")

If both values aren't present in the message, ask for them before proceeding.

## What to generate

Inside packages/api/src/modules/<MODULE_NAME>/, create exactly five
files, following .kiro/steering/coding-standards.md and
.kiro/steering/tech-stack.md:

- types.ts — a <ENTITY_NAME> interface with id: string and
  userId: string, plus fields inferred from
  .kiro/specs/dailyflow/design.md for this module.
- repository.ts — SQLite queries via better-sqlite3 only, no
  business logic. CRUD functions: create, findById, findAllByUser,
  update, remove.
- service.ts — business logic only, calls repository.ts, never
  queries the DB directly. Every exported function has JSDoc with
  @param/@returns tags and an explicit return type.
- router.ts — Express router mounted at /api/v1/<MODULE_NAME>.
  Every handler returns { data: T, error: string | null }, never a
  bare object.
- <MODULE_NAME>.test.ts — Vitest tests, at least one happy path and
  one error path per service function.

## Rules
- Never modify files outside this module's folder.
- Never touch packages/api/src/modules/score/.
- Match field names exactly to what's in design.md for this entity.
- If service.ts already exists in this module (this will be the
  case for habits — it contains an existing computeStreak()
  function), preserve that function exactly as-is. Do not fix,
  rewrite, or "improve" its logic. Add any other required service
  functions around it without touching it.