# Draw on Git History

A full-stack TypeScript application that lets you paint a GitHub-style contribution graph and generate a Git repository whose commits match the pattern. The result is a local folder you can push to GitHub to render the desired contribution grid.

## Highlights
- **7x51 grid editor** that mirrors the drawable portion of a GitHub contribution year (first and last weeks excluded).
- **Deterministic commit planning** with optional random seeds for reproducibility.
- **Preview before write** to verify totals and warnings.
- **One-click generation** to create a fully initialized Git repository with dated commits.

## Quick Start

### 1) Start the API server
```bash
cd server
npm install
npm run dev
```

The server listens on `http://localhost:4321` and writes generated repositories under `../` by default (so the default UI folder name `fake-history` resolves to `../fake-history`).

### 2) Start the web client
```bash
cd web
npm install
npm run dev
```

Open `http://localhost:5173` and start drawing.

## Configuration

The server reads environment variables:

- `PORT`: API port (default: `4321`).
- `OUTPUT_ROOT`: absolute or relative path for generated repositories (default: `../`).
- `GIT_AUTHOR_NAME`: Git author name used in commits.
- `GIT_AUTHOR_EMAIL`: Git author email used in commits.
- `ALLOW_OUTPUT_ROOT_OVERRIDE`: allow per-request override of `outputRoot` (default: `false`).

## Documentation

- Architecture overview: `docs/ARCHITECTURE.md`
- API reference: `docs/API.md`
- Algorithm details: `docs/ALGORITHM.md`
- UX rationale: `docs/UX.md`

## Notes
- Ensure `git` is installed and configured on your machine.
- The generated repository is local. To affect a GitHub contribution graph, push the repo to GitHub and ensure the commits use your account's email address.
- Respect your organization's policies and GitHub's terms of service when generating synthetic histories.

## Push the Generated Repo to GitHub
After generation (using the default folder name), you can push to a new private repo:

```bash
cd ../fake-history
git remote add origin git@github.com:<USERNAME>/fake-history.git
git push -u origin main
```
