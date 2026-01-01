/**
 * Props for folder name input.
 */
export interface FolderInputsProps {
  /** Folder name. */
  folderName: string;
  /** Change handler for folder name. */
  onFolderNameChange: (value: string) => void;
}

/**
 * Renders folder name input.
 *
 * @param props Component props.
 * @return JSX element.
 */
export function FolderInputs({ folderName, onFolderNameChange }: FolderInputsProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Repository Target</h3>
        <p>The server will create a new Git repo inside its configured output root.</p>
      </div>
      <div className="panel-body">
        <label className="field">
          <span>Folder name</span>
          <input
            type="text"
            placeholder="my-drawn-history"
            value={folderName}
            onChange={(event) => onFolderNameChange(event.target.value)}
          />
        </label>
        <span className="helper-text">Allowed: letters, numbers, dots, dashes, underscores.</span>
      </div>
    </div>
  );
}
