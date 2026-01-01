import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type { CommitLevel } from "../../../shared/src/types";
import { getDateForCell } from "../utils/date";

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

/**
 * Props for the contribution grid.
 */
export interface GridProps {
  /** Grid levels by row then column. */
  grid: CommitLevel[][];
  /** Start date for the grid. */
  startDate: string;
  /** Selected level for painting. */
  selectedLevel: CommitLevel;
  /** Whether the user is currently drawing. */
  isDrawing: boolean;
  /** Handler invoked when a cell should be painted. */
  onCellPaint: (
    rowIndex: number,
    colIndex: number,
    level: CommitLevel,
    action: "click" | "drag"
  ) => void;
  /** Handler invoked when drawing starts. */
  onDrawStart: () => void;
  /** Handler invoked when drawing ends. */
  onDrawEnd: () => void;
}

/**
 * Renders the 7x51 contribution grid editor.
 *
 * @param props Component props.
 * @return JSX element.
 */
export function Grid({
  grid,
  startDate,
  selectedLevel,
  isDrawing,
  onCellPaint,
  onDrawStart,
  onDrawEnd,
}: GridProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [sizing, setSizing] = useState({
    cellSize: 12,
    gap: 2.4,
    labelWidth: 60,
    labelGap: 12,
    labelFontSize: 10,
  });
  const rowLabels = getRowLabels(startDate);

  useEffect(() => {
    if (!wrapperRef.current) {
      return;
    }

    const updateSizing = (width: number) => {
      const labelWidth = clamp(width * 0.1, 48, 64);
      const labelGap = clamp(width * 0.02, 8, 12);
      const availableWidth = width - labelWidth - labelGap;
      const safeWidth = Math.max(availableWidth, 1);
      const cellSize = safeWidth / 61;
      const gap = cellSize / 5;
      const labelFontSize = Math.max(10, cellSize * 0.65);
      setSizing({ cellSize, gap, labelWidth, labelGap, labelFontSize });
    };

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        updateSizing(entry.contentRect.width);
      }
    });

    observer.observe(wrapperRef.current);
    updateSizing(wrapperRef.current.getBoundingClientRect().width);

    return () => observer.disconnect();
  }, []);

  const wrapperStyle: CSSProperties = {
    "--cell-size": `${sizing.cellSize}px`,
    "--grid-gap": `${sizing.gap}px`,
    "--labels-width": `${sizing.labelWidth}px`,
    "--label-gap": `${sizing.labelGap}px`,
    "--label-font-size": `${sizing.labelFontSize}px`,
  };

  return (
    <div className="grid-wrapper" ref={wrapperRef} style={wrapperStyle}>
      <div className="grid-labels">
        {rowLabels.map((label, index) => (
          <div key={`${label}-${index}`} className="grid-label">
            {label}
          </div>
        ))}
      </div>
      <div
        className="grid"
        role="grid"
        onPointerLeave={onDrawEnd}
        onPointerUp={onDrawEnd}
      >
        {grid.map((row, rowIndex) =>
          row.map((level, colIndex) => {
            const dateLabel = startDate
              ? getDateForCell(startDate, rowIndex, colIndex)
              : "";
            return (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                className={`cell level-${level}`}
                aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1} (${dateLabel})`}
                onPointerDown={(event) => {
                  event.preventDefault();
                  onDrawStart();
                  onCellPaint(rowIndex, colIndex, selectedLevel, "click");
                }}
                onPointerEnter={() => {
                  if (isDrawing) {
                    onCellPaint(rowIndex, colIndex, selectedLevel, "drag");
                  }
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

/**
 * Builds row labels aligned to the start date's day of week.
 *
 * @param startDate Start date string.
 * @return Ordered list of day labels.
 */
function getRowLabels(startDate: string): string[] {
  if (!startDate) {
    return [...DAY_LABELS];
  }
  const parsed = new Date(`${startDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return [...DAY_LABELS];
  }
  const startIndex = parsed.getDay();
  return DAY_LABELS.map((_, index) => DAY_LABELS[(startIndex + index) % 7]);
}

/**
 * Clamps a number between min and max.
 *
 * @param value Numeric value.
 * @param min Minimum value.
 * @param max Maximum value.
 * @return Clamped value.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
