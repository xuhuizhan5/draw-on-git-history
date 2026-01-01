import { useEffect, useMemo, useState } from "react";
import type {
  CommitIntensityMap,
  CommitLevel,
  GenerateRequest,
  PreviewRequest,
  PreviewResponse,
} from "../../shared/src/types";
import { generatePlan, previewPlan } from "./api/client";
import { DateInputs } from "./components/DateInputs";
import { FolderInputs } from "./components/FolderInputs";
import { Grid } from "./components/Grid";
import { CommitIdentity } from "./components/CommitIdentity";
import { IntensitySettings } from "./components/IntensitySettings";
import { Legend } from "./components/Legend";
import { PreviewPanel } from "./components/PreviewPanel";
import {
  diffInDays,
  getDateForCell,
  isValidIsoDate,
  suggestRangeForYear,
} from "./utils/date";

const GRID_ROWS = 7;
const GRID_COLS = 51;
const EXPECTED_DAYS = GRID_ROWS * GRID_COLS;
const LEVELS: CommitLevel[] = [0, 1, 2, 3, 4];

const DEFAULT_INTENSITY: CommitIntensityMap = {
  minByLevel: { 0: 0, 1: 1, 2: 3, 3: 6, 4: 10 },
  maxByLevel: { 0: 0, 1: 2, 2: 5, 3: 9, 4: 14 },
};

/**
 * Builds an empty grid filled with 0-levels.
 *
 * @return 7x51 grid.
 */
function createEmptyGrid(): CommitLevel[][] {
  return Array.from({ length: GRID_ROWS }, () =>
    Array.from({ length: GRID_COLS }, () => 0 as CommitLevel)
  );
}

/**
 * Root application component.
 *
 * @return JSX element.
 */
export default function App() {
  const currentYear = new Date().getFullYear();
  const suggestedRange = useMemo(
    () => suggestRangeForYear(currentYear),
    [currentYear]
  );

  const [grid, setGrid] = useState<CommitLevel[][]>(createEmptyGrid());
  const [folderName, setFolderName] = useState("fake-history");
  const [startDate, setStartDate] = useState(suggestedRange.startDate);
  const [endDate, setEndDate] = useState(suggestedRange.endDate);
  const [year, setYear] = useState(currentYear);
  const [seed, setSeed] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<CommitLevel>(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [intensityMap, setIntensityMap] =
    useState<CommitIntensityMap>(DEFAULT_INTENSITY);
  const [authorName, setAuthorName] = useState("Draw Bot");
  const [authorEmail, setAuthorEmail] = useState("drawbot@example.com");
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [repoPath, setRepoPath] = useState<string | undefined>(undefined);
  const [gitLogSample, setGitLogSample] = useState<string[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const gridPreviewDate = useMemo(() => {
    if (!startDate || !isValidIsoDate(startDate)) {
      return "";
    }
    return getDateForCell(startDate, 6, 50);
  }, [startDate]);

  const rangeDiff = useMemo(() => {
    if (!startDate || !endDate) {
      return null;
    }
    if (!isValidIsoDate(startDate) || !isValidIsoDate(endDate)) {
      return null;
    }
    return diffInDays(startDate, endDate);
  }, [startDate, endDate]);

  const rangeWarning = useMemo(() => {
    if (rangeDiff === null) {
      return "";
    }
    if (rangeDiff !== EXPECTED_DAYS - 1) {
      return `Date range should span ${EXPECTED_DAYS} days. Current span: ${rangeDiff + 1} days.`;
    }
    if (endDate !== gridPreviewDate) {
      return `End date should be ${gridPreviewDate} for the selected start date.`;
    }
    return "";
  }, [rangeDiff, endDate, gridPreviewDate]);

  const intensityWarning = useMemo(() => {
    for (const level of LEVELS) {
      const min = intensityMap.minByLevel[level];
      const max = intensityMap.maxByLevel[level];
      if (min < 0 || max < 0) {
        return "Commit counts must be non-negative.";
      }
      if (min > max) {
        return `Level ${level} has min greater than max.`;
      }
    }
    return "";
  }, [intensityMap]);

  useEffect(() => {
    const handlePointerUp = () => setIsDrawing(false);
    window.addEventListener("pointerup", handlePointerUp);
    return () => window.removeEventListener("pointerup", handlePointerUp);
  }, []);

  const handleCellPaint = (
    rowIndex: number,
    colIndex: number,
    nextLevel: CommitLevel,
    action: "click" | "drag"
  ) => {
    setGrid((prev) => {
      const clone = prev.map((row) => [...row]) as CommitLevel[][];
      const current = clone[rowIndex][colIndex];
      if (action === "click" && current !== 0) {
        clone[rowIndex][colIndex] = 0;
        return clone;
      }
      clone[rowIndex][colIndex] = nextLevel;
      return clone;
    });
  };

  const resetGrid = () => {
    setGrid(createEmptyGrid());
    setPreview(null);
    setRepoPath(undefined);
    setGitLogSample(undefined);
    setIsDrawing(false);
  };

  const buildPreviewPayload = (): PreviewRequest => ({
    folderName: folderName.trim(),
    dateRange: { startDate, endDate },
    grid: { rows: GRID_ROWS, cols: GRID_COLS, levels: grid },
    randomSeed: seed.trim() ? seed.trim() : undefined,
    intensityMap,
    author: authorName.trim() && authorEmail.trim()
      ? { name: authorName.trim(), email: authorEmail.trim() }
      : undefined,
  });

  const handlePreview = async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await previewPlan(buildPreviewPayload());
      setPreview(response);
      setRepoPath(undefined);
      setGitLogSample(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preview plan.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setLoading(true);
    try {
      const payload: GenerateRequest = {
        ...buildPreviewPayload(),
        dryRun: false,
        overwriteExisting,
      };
      const response = await generatePlan(payload);
      setPreview({
        summary: response.summary,
        warnings: preview?.warnings ?? [],
        plan: preview?.plan ?? [],
      });
      setRepoPath(response.repoPath);
      setGitLogSample(response.gitLogSample);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate commits.");
    } finally {
      setLoading(false);
    }
  };

  const applySuggestedRange = () => {
    const suggested = suggestRangeForYear(year);
    setStartDate(suggested.startDate);
    setEndDate(suggested.endDate);
  };

  return (
    <div className="app">
      <header className="hero">
        <div>
          <p className="eyebrow">Draw on Git History</p>
          <h1>Design a contribution graph you can commit for real.</h1>
          <p className="subhead">
            Plan a 7x51 grid, preview the totals, then generate a Git repository
            with the exact commit cadence.
          </p>
        </div>
        <div className="hero-card">
          <div>
            <h2>How it works</h2>
            <ol>
              <li>Pick the exact date range for the grid.</li>
              <li>Paint intensities to form your pattern.</li>
              <li>Preview totals, then generate a Git repo.</li>
            </ol>
          </div>
        </div>
      </header>

      <main className="main">
        <section className="controls-row">
          <div className="controls-column">
            <FolderInputs
              folderName={folderName}
              onFolderNameChange={setFolderName}
            />
            <CommitIdentity
              authorName={authorName}
              authorEmail={authorEmail}
              overwriteExisting={overwriteExisting}
              onAuthorNameChange={setAuthorName}
              onAuthorEmailChange={setAuthorEmail}
              onOverwriteExistingChange={setOverwriteExisting}
            />
          </div>
          <div className="controls-column">
            <DateInputs
              startDate={startDate}
              endDate={endDate}
              year={year}
              onStartDateChange={setStartDate}
              onEndDateChange={setEndDate}
              onYearChange={setYear}
              onApplySuggestedRange={applySuggestedRange}
            />
            <IntensitySettings
              intensityMap={intensityMap}
              onIntensityChange={setIntensityMap}
            />
          </div>
          <div className="controls-column">
            <div className="panel">
              <div className="panel-header">
                <h3>Advanced Settings</h3>
                <p>Optional inputs for deterministic results.</p>
              </div>
              <div className="panel-body">
                <label className="field">
                  <span>Random seed (optional)</span>
                  <input
                    type="text"
                    placeholder="e.g. launch-2024"
                    value={seed}
                    onChange={(event) => setSeed(event.target.value)}
                  />
                </label>
              </div>
            </div>
            <div className="panel actions-panel">
              <div className="panel-header">
                <h3>Actions</h3>
                <p>Preview first, then generate commits.</p>
              </div>
              <div className="panel-body actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={handlePreview}
                  disabled={
                    loading || !!rangeWarning || !!intensityWarning || !folderName.trim()
                  }
                >
                  {loading ? "Working..." : "Preview plan"}
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={handleGenerate}
                  disabled={
                    loading || !!rangeWarning || !!intensityWarning || !folderName.trim()
                  }
                >
                  {loading ? "Generating..." : "Generate commits"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {error && <div className="error">{error}</div>}

        <section className="canvas-section">
          <div className="canvas-header">
            <div>
              <h2>Contribution Canvas</h2>
              <p>Pick a level, then click or drag to paint in any direction.</p>
            </div>
            <Legend
              selectedLevel={selectedLevel}
              onSelectLevel={setSelectedLevel}
            />
          </div>
          <Grid
            grid={grid}
            startDate={startDate}
            selectedLevel={selectedLevel}
            isDrawing={isDrawing}
            onCellPaint={handleCellPaint}
            onDrawStart={() => setIsDrawing(true)}
            onDrawEnd={() => setIsDrawing(false)}
          />
          <div className="canvas-actions">
            <button type="button" className="secondary" onClick={resetGrid}>
              Reset grid
            </button>
            {(rangeWarning || intensityWarning) && (
              <span className="warning">{rangeWarning || intensityWarning}</span>
            )}
          </div>
        </section>

        <section className="summary-section">
          <PreviewPanel
            summary={preview?.summary ?? null}
            warnings={preview?.warnings ?? []}
            repoPath={repoPath}
            gitLogSample={gitLogSample}
          />
        </section>
      </main>
    </div>
  );
}
