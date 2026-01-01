# Architecture

## Overview
The repository is split into three focused packages:

- `server/`: Express + TypeScript API that validates inputs, builds a commit plan, and generates a Git repository with dated commits.
- `web/`: React + TypeScript UI for drawing the 7x51 grid, previewing totals, and triggering generation.
- `shared/`: Shared API contracts and domain types consumed by both the server and the web client.

This separation keeps the API contract explicit and allows the frontend and backend to evolve independently while remaining type-safe.

## Core Flow
1. The user defines a folder name and a 7x51 grid of intensity values.
2. The frontend sends `/api/preview` with the grid and date range.
3. The server validates the request and builds a deterministic commit plan.
4. The user confirms the preview and submits `/api/generate`.
5. The server creates a Git repository and writes commits with timestamps that match the plan.

## Key Design Principles
- **Determinism by default**: commit counts and timestamps are seeded by date range or an explicit seed.
- **Explicit validation**: both the API layer and domain layer validate grid shape and date range invariants.
- **Auditability**: `history.json` is generated inside the repo to record the plan summary and generation timestamp.

## Extension Points
- Add additional intensity mappings or commit-time heuristics in `server/src/config/config.ts`.
- Add a richer grid editor in `web/src/components/Grid.tsx`.
- Introduce authentication and storage by adding middleware in `server/src/app.ts`.
