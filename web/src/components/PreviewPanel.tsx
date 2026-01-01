import type { CommitPlanSummary } from "../../../shared/src/types";

/**
 * Props for the preview panel.
 */
export interface PreviewPanelProps {
  /** Summary data. */
  summary: CommitPlanSummary | null;
  /** Warnings to display. */
  warnings: string[];
  /** Optional repository path after generation. */
  repoPath?: string;
  /** Optional git log sample lines. */
  gitLogSample?: string[];
  /** Current loading action. */
  loadingAction: "preview" | "generate" | null;
  /** Progress percentage for the active action. */
  progress: number;
  /** Current status for progress updates. */
  progressStatus: "pending" | "running" | "complete" | "error" | null;
  /** Progress status message. */
  progressMessage: string;
  /** Folder name for push instructions. */
  folderName: string;
  /** GitHub username for push instructions. */
  githubUsername: string;
}

/**
 * Renders the preview summary panel.
 *
 * @param props Component props.
 * @return JSX element.
 */
export function PreviewPanel({
  summary,
  warnings,
  repoPath,
  gitLogSample,
  loadingAction,
  progress,
  progressStatus,
  progressMessage,
  folderName,
  githubUsername,
}: PreviewPanelProps) {
  const isLoading = loadingAction !== null;
  const isGenerating = loadingAction === "generate";
  const isPreviewing = loadingAction === "preview";
  const progressValue = Math.min(100, Math.max(0, Math.round(progress)));
  const progressLabel =
    progressMessage ||
    (progressStatus === "pending" ? "Waiting for generation" : "Writing commits");
  const resolvedFolder = folderName.trim();
  const resolvedUsername = githubUsername.trim();
  const hasPushValues = resolvedFolder.length > 0 && resolvedUsername.length > 0;

  if (!summary && !isLoading) {
    return (
      <div className="panel ghost">
        <p>Preview your plan to see the calculated totals and warnings.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>
          {isLoading
            ? loadingAction === "generate"
              ? "Generating commits"
              : "Previewing plan"
            : "Plan Summary"}
        </h3>
        <p>
          {isLoading
            ? "Hang tight while we build your commit plan."
            : "Review the numbers before you generate commits."}
        </p>
      </div>
      <div className="panel-body">
        {isGenerating && (
          <div className="progress-card" role="status" aria-live="polite">
            <div className="progress-header">
              <span>{progressLabel}</span>
              <span>{progressValue}%</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progressValue}%` }}
              />
            </div>
            <p className="helper-text">
              Larger patterns take longer. Keep this tab open while it runs.
            </p>
          </div>
        )}
        {isPreviewing && (
          <div className="progress-card" role="status" aria-live="polite">
            <div className="progress-header">
              <span>Calculating preview totals</span>
            </div>
            <p className="helper-text">
              Preview runs quickly for most grids.
            </p>
          </div>
        )}
        {summary && (
          <div className="summary-grid">
            <div>
              <span>Total commits</span>
              <strong>{summary.totalCommits}</strong>
            </div>
            <div>
              <span>Active days</span>
              <strong>{summary.activeDays}</strong>
            </div>
            <div>
              <span>First grid date</span>
              <strong>{summary.firstGridDate}</strong>
            </div>
            <div>
              <span>Last grid date</span>
              <strong>{summary.lastGridDate}</strong>
            </div>
          </div>
        )}
        {summary && warnings.length > 0 && (
          <div className="warnings">
            <h4>Warnings</h4>
            <ul>
              {warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        )}
        {repoPath && (
          <div className="generation-result">
            <div className="success-callout" role="status">
              Commit history generated successfully.
            </div>
            <h4>Generated Repository</h4>
            <p>{repoPath}</p>
            {gitLogSample && gitLogSample.length > 0 && (
              <pre>{gitLogSample.join("\n")}</pre>
            )}
            <div className="push-instructions">
              <h4>Push to GitHub</h4>
              {hasPushValues ? (
                <>
                  <p className="helper-text">
                    Create a GitHub repo named{" "}
                    <strong className="inline-highlight">{resolvedFolder}</strong>{" "}
                    under{" "}
                    <strong className="inline-highlight">{resolvedUsername}</strong>{" "}
                    first, then run:
                  </p>
                  <pre className="instruction-block">{`cd ${resolvedFolder}
git remote add origin git@github.com:${resolvedUsername}/${resolvedFolder}.git
git push -u origin main`}</pre>
                  <p className="helper-text">
                    Uses your GitHub username and folder name from the form above.
                  </p>
                </>
              ) : (
                <p className="helper-text">
                  Add a GitHub username and folder name to see the exact push
                  commands.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
