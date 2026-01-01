import type { ChangeEvent } from "react";

/**
 * Props for commit identity inputs.
 */
export interface CommitIdentityProps {
  /** Commit author name. */
  authorName: string;
  /** Commit author email. */
  authorEmail: string;
  /** Replace existing repo flag. */
  overwriteExisting: boolean;
  /** Change handler for author name. */
  onAuthorNameChange: (value: string) => void;
  /** Change handler for author email. */
  onAuthorEmailChange: (value: string) => void;
  /** Change handler for overwrite option. */
  onOverwriteExistingChange: (value: boolean) => void;
}

/**
 * Renders commit identity settings.
 *
 * @param props Component props.
 * @return JSX element.
 */
export function CommitIdentity({
  authorName,
  authorEmail,
  overwriteExisting,
  onAuthorNameChange,
  onAuthorEmailChange,
  onOverwriteExistingChange,
}: CommitIdentityProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Commit Identity</h3>
        <p>Use the GitHub-verified email you want credited.</p>
      </div>
      <div className="panel-body">
        <label className="field">
          <span>Author name</span>
          <input
            type="text"
            placeholder="Jane Doe"
            value={authorName}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onAuthorNameChange(event.target.value)
            }
          />
        </label>
        <label className="field">
          <span>Author email</span>
          <input
            type="email"
            placeholder="jane@example.com"
            value={authorEmail}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onAuthorEmailChange(event.target.value)
            }
          />
        </label>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={overwriteExisting}
            onChange={(event) => onOverwriteExistingChange(event.target.checked)}
          />
          <span>Replace existing repository on generate</span>
        </label>
        <span className="helper-text">
          Recommended when changing identity, so old commits are removed.
        </span>
      </div>
    </div>
  );
}
