import { useEffect, useMemo, useRef, useState } from "react";
import type {
  CommitIntensityMap,
  CommitLevel,
  GenerateRequest,
  PreviewRequest,
  PreviewResponse,
} from "../../shared/src/types";
import { generatePlan, previewPlan, progressStreamUrl } from "./api/client";
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
  const defaultYear = 2025;
  const suggestedRange = useMemo(
    () => suggestRangeForYear(defaultYear),
    [defaultYear]
  );

  const [grid, setGrid] = useState<CommitLevel[][]>(createEmptyGrid());
  const [folderName, setFolderName] = useState("fake-history");
  const [startDate, setStartDate] = useState(suggestedRange.startDate);
  const [endDate, setEndDate] = useState(suggestedRange.endDate);
  const [year, setYear] = useState(defaultYear);
  const [seed, setSeed] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<CommitLevel>(2);
  const [isDrawing, setIsDrawing] = useState(false);
  const [intensityMap, setIntensityMap] =
    useState<CommitIntensityMap>(DEFAULT_INTENSITY);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubEmail, setGithubEmail] = useState("");
  const [overwriteExisting, setOverwriteExisting] = useState(true);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [repoPath, setRepoPath] = useState<string | undefined>(undefined);
  const [gitLogSample, setGitLogSample] = useState<string[] | undefined>(undefined);
  const [loadingAction, setLoadingAction] = useState<"preview" | "generate" | null>(
    null
  );
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");
  const [progressStatus, setProgressStatus] = useState<
    "pending" | "running" | "complete" | "error" | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const summaryRef = useRef<HTMLElement | null>(null);
  const progressSourceRef = useRef<EventSource | null>(null);

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

  useEffect(() => {
    return () => {
      progressSourceRef.current?.close();
    };
  }, []);

  const scrollToSummary = () => {
    summaryRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const closeProgressStream = () => {
    progressSourceRef.current?.close();
    progressSourceRef.current = null;
  };

  const startProgressStream = (progressId: string) => {
    closeProgressStream();
    const source = new EventSource(progressStreamUrl(progressId));
    progressSourceRef.current = source;

    source.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as {
          progress: number;
          status: "pending" | "running" | "complete" | "error";
          message?: string;
          error?: string;
        };
        setProgress(payload.progress);
        setProgressStatus(payload.status);
        if (payload.message) {
          setProgressMessage(payload.message);
        }
        if (payload.status === "complete" || payload.status === "error") {
          closeProgressStream();
        }
      } catch (err) {
        closeProgressStream();
      }
    };

    source.onerror = () => {
      closeProgressStream();
    };
  };

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
    author: githubUsername.trim() && githubEmail.trim()
      ? { name: githubUsername.trim(), email: githubEmail.trim() }
      : undefined,
  });

  const handlePreview = async () => {
    setError(null);
    setPreview(null);
    setRepoPath(undefined);
    setGitLogSample(undefined);
    closeProgressStream();
    setProgress(0);
    setProgressMessage("");
    setProgressStatus(null);
    setLoadingAction("preview");
    scrollToSummary();
    try {
      const response = await previewPlan(buildPreviewPayload());
      setPreview(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to preview plan.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setPreview(null);
    setRepoPath(undefined);
    setGitLogSample(undefined);
    const progressId = crypto.randomUUID();
    startProgressStream(progressId);
    setProgress(0);
    setProgressMessage("Preparing repository");
    setProgressStatus("pending");
    setLoadingAction("generate");
    scrollToSummary();
    try {
      const payload: GenerateRequest = {
        ...buildPreviewPayload(),
        dryRun: false,
        overwriteExisting,
        progressId,
      };
      const response = await generatePlan(payload);
      setPreview({
        summary: response.summary,
        warnings: response.warnings,
        plan: [],
      });
      setRepoPath(response.repoPath);
      setGitLogSample(response.gitLogSample);
      setProgress(100);
      setProgressStatus("complete");
      closeProgressStream();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate commits.");
      setProgressStatus("error");
      closeProgressStream();
    } finally {
      setLoadingAction(null);
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
            <CommitIdentity
              githubUsername={githubUsername}
              githubEmail={githubEmail}
              overwriteExisting={overwriteExisting}
              onGithubUsernameChange={setGithubUsername}
              onGithubEmailChange={setGithubEmail}
              onOverwriteExistingChange={setOverwriteExisting}
            />
            <FolderInputs
              folderName={folderName}
              onFolderNameChange={setFolderName}
            />
          </div>
          <div className="controls-column">
            <IntensitySettings
              intensityMap={intensityMap}
              onIntensityChange={setIntensityMap}
            />
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
                    placeholder="e.g. Happy new year! Welcome to 2026!"
                    value={seed}
                    onChange={(event) => setSeed(event.target.value)}
                  />
                </label>
              </div>
            </div>
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
                    !!loadingAction ||
                    !!rangeWarning ||
                    !!intensityWarning ||
                    !folderName.trim()
                  }
                >
                  {loadingAction === "preview" ? "Previewing..." : "Preview plan"}
                </button>
                <button
                  type="button"
                  className="primary"
                  onClick={handleGenerate}
                  disabled={
                    !!loadingAction ||
                    !!rangeWarning ||
                    !!intensityWarning ||
                    !folderName.trim()
                  }
                >
                  {loadingAction === "generate" ? "Generating..." : "Generate commits"}
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
              <p className="note">
                GitHub recalculates contribution colors across your full history, so
                shades can shift once you push this repo.
              </p>
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

        <section className="summary-section" ref={summaryRef}>
          <PreviewPanel
            summary={preview?.summary ?? null}
            warnings={preview?.warnings ?? []}
            repoPath={repoPath}
            gitLogSample={gitLogSample}
            loadingAction={loadingAction}
            progress={progress}
            progressStatus={progressStatus}
            progressMessage={progressMessage}
            folderName={folderName}
            githubUsername={githubUsername}
          />
        </section>
      </main>
    </div>
  );
}
