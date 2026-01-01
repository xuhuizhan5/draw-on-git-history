# Commit Planning Algorithm

## Grid-to-Date Mapping
- The grid is 7 rows x 51 columns (357 days).
- Row index `0` maps to Sunday, row index `6` maps to Saturday.
- Column index `0` is the first full week starting on Sunday.
- The top-left cell corresponds to `startDate`.
- For any cell `(row, col)`:
  - `offsetDays = col * 7 + row`
  - `cellDate = startDate + offsetDays`

The server validates that `endDate` equals `startDate + 356 days`.

## Intensity-to-Commit Counts
Each cell has a level (0-4). Levels map to a commit count range:

- Level 0: 0 commits
- Level 1: 1-2 commits
- Level 2: 3-5 commits
- Level 3: 6-9 commits
- Level 4: 10-14 commits

A seeded RNG picks a commit count within each range, ensuring deterministic plans when the seed is unchanged.

## Commit Timestamps
- Commits are scheduled between 09:00 and 20:00 local time.
- Each commit's timestamp is generated using the same seeded RNG and sorted to keep Git history chronological.
- Git timestamps are formatted as `YYYY-MM-DDTHH:mm:ss+/-HHMM` and written via `--date` plus `GIT_AUTHOR_DATE`/`GIT_COMMITTER_DATE`.
