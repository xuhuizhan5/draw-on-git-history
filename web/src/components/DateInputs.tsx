import { ChangeEvent } from "react";

/**
 * Props for date input controls.
 */
export interface DateInputsProps {
  /** Start date value. */
  startDate: string;
  /** End date value. */
  endDate: string;
  /** Suggested year for auto-fill. */
  year: number;
  /** Change handler for start date. */
  onStartDateChange: (value: string) => void;
  /** Change handler for end date. */
  onEndDateChange: (value: string) => void;
  /** Change handler for year input. */
  onYearChange: (value: number) => void;
  /** Handler to apply suggested range. */
  onApplySuggestedRange: () => void;
}

/**
 * Renders date range inputs and suggestion helper.
 *
 * @param props Component props.
 * @return JSX element.
 */
export function DateInputs({
  startDate,
  endDate,
  year,
  onStartDateChange,
  onEndDateChange,
  onYearChange,
  onApplySuggestedRange,
}: DateInputsProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Calendar Range</h3>
        <p>Define the first and last date that your 7x51 grid spans.</p>
      </div>
      <div className="panel-body">
        <label className="field">
          <span>Start date</span>
          <input
            type="date"
            value={startDate}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onStartDateChange(event.target.value)
            }
          />
        </label>
        <label className="field">
          <span>End date</span>
          <input
            type="date"
            value={endDate}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onEndDateChange(event.target.value)
            }
          />
        </label>
        <div className="field-row">
          <label className="field">
            <span>Year helper</span>
            <input
              type="number"
              min={1970}
              max={2100}
              value={year}
              onChange={(event) => onYearChange(Number(event.target.value))}
            />
          </label>
          <button type="button" className="secondary" onClick={onApplySuggestedRange}>
            Use suggested range
          </button>
        </div>
      </div>
    </div>
  );
}
