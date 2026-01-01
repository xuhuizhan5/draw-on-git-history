import type { CommitIntensityMap, CommitLevel } from "../../../shared/src/types";

const LEVELS: CommitLevel[] = [0, 1, 2, 3, 4];

/**
 * Props for intensity settings.
 */
export interface IntensitySettingsProps {
  /** Current intensity map. */
  intensityMap: CommitIntensityMap;
  /** Handler invoked when intensity changes. */
  onIntensityChange: (map: CommitIntensityMap) => void;
}

/**
 * Renders commit intensity controls.
 *
 * @param props Component props.
 * @return JSX element.
 */
export function IntensitySettings({
  intensityMap,
  onIntensityChange,
}: IntensitySettingsProps) {
  const handleChange = (
    level: CommitLevel,
    field: "min" | "max",
    value: number
  ) => {
    const safeValue = Number.isFinite(value) ? Math.max(0, value) : 0;
    const next: CommitIntensityMap = {
      minByLevel: { ...intensityMap.minByLevel },
      maxByLevel: { ...intensityMap.maxByLevel },
    };
    if (field === "min") {
      next.minByLevel[level] = safeValue;
    } else {
      next.maxByLevel[level] = safeValue;
    }
    onIntensityChange(next);
  };

  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Intensity Settings</h3>
        <p>Define commit count ranges per level.</p>
      </div>
      <div className="panel-body intensity-panel">
        {LEVELS.map((level) => {
          const min = intensityMap.minByLevel[level];
          const max = intensityMap.maxByLevel[level];
          const isLocked = level === 0;
          return (
            <div className="intensity-row" key={level}>
              <div className={`legend-swatch level-${level}`} />
              <span className="intensity-label">Level {level}</span>
              <label className="field compact">
                <span>Min</span>
                <input
                  type="number"
                  min={0}
                  value={min}
                  disabled={isLocked}
                  onChange={(event) =>
                    handleChange(level, "min", Number(event.target.value))
                  }
                />
              </label>
              <label className="field compact">
                <span>Max</span>
                <input
                  type="number"
                  min={0}
                  value={max}
                  disabled={isLocked}
                  onChange={(event) =>
                    handleChange(level, "max", Number(event.target.value))
                  }
                />
              </label>
            </div>
          );
        })}
        <span className="helper-text">Level 0 always stays empty.</span>
      </div>
    </div>
  );
}
