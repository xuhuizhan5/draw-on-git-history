# API Reference

Base URL: `http://localhost:4321`

## POST /api/preview
Builds and returns a commit plan without executing Git commands.

### Request Body
- `folderName` (string, required): repository folder name under the server output root (letters, numbers, dots, underscores, dashes).
- `dateRange.startDate` (string, required): ISO date for the first grid cell.
- `dateRange.endDate` (string, required): ISO date for the last grid cell.
- `grid.rows` (number, required): must be `7`.
- `grid.cols` (number, required): must be `51`.
- `grid.levels` (number[][], required): 7x51 grid of levels (0-4).
- `intensityMap` (optional): overrides the default min/max commit ranges.
- `randomSeed` (optional): seed for deterministic commit counts.
- `author` (optional): object with `name` and `email` for commit attribution.

### Response
- `summary`: totals and date bounds.
- `warnings`: human-friendly warnings for UI display.
- `plan`: list of `{ date, level, commitCount }` entries.

## POST /api/generate
Creates a new Git repository and writes commits matching the plan.

### Request Body
Same as `/api/preview`, plus:
- `dryRun` (boolean, optional): if true, validates and returns without writing Git commits.
- `overwriteExisting` (boolean, optional): if true, deletes the existing repo folder before generation.

### Response
- `summary`: totals and date bounds.
- `repoPath`: absolute path of the created repository.
- `gitLogSample`: top 5 commits as a sanity check.

## Error Format
Errors return JSON with:
- `error` (string): human-readable message.
- `details` (string, optional): additional diagnostics.
