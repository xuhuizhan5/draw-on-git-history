import type { CommitLevel } from "../../../shared/src/types";

/**
 * Props for the legend and palette.
 */
export interface LegendProps {
  /** Currently selected level. */
  selectedLevel: CommitLevel;
  /** Handler invoked when a level is selected. */
  onSelectLevel: (level: CommitLevel) => void;
}

/**
 * Color legend and palette for the grid intensities.
 *
 * @param props Component props.
 * @return JSX element.
 */
export function Legend({ selectedLevel, onSelectLevel }: LegendProps) {
  return (
    <div className="legend">
      <span className="legend-label">Low</span>
      <div className="legend-swatches" role="group" aria-label="Pick intensity">
        {[0, 1, 2, 3, 4].map((level) => {
          const levelValue = level as CommitLevel;
          const isActive = selectedLevel === levelValue;
          return (
            <button
              key={level}
              type="button"
              className={`legend-swatch level-${level} ${isActive ? "active" : ""}`}
              aria-pressed={isActive}
              onClick={() => onSelectLevel(levelValue)}
            />
          );
        })}
      </div>
      <span className="legend-label">High</span>
    </div>
  );
}
