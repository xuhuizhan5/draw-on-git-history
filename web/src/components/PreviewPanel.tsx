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
}: PreviewPanelProps) {
  if (!summary) {
    return (
      <div className="panel ghost">
        <p>Preview your plan to see the calculated totals and warnings.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Plan Summary</h3>
        <p>Review the numbers before you generate commits.</p>
      </div>
      <div className="panel-body">
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
        {warnings.length > 0 && (
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
            <h4>Generated Repository</h4>
            <p>{repoPath}</p>
            {gitLogSample && gitLogSample.length > 0 && (
              <pre>{gitLogSample.join("\n")}</pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
