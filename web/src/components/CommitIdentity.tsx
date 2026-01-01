import type { ChangeEvent } from "react";

/**
 * Props for commit identity inputs.
 */
export interface CommitIdentityProps {
  /** GitHub username to credit. */
  githubUsername: string;
  /** GitHub email to credit. */
  githubEmail: string;
  /** Replace existing repo flag. */
  overwriteExisting: boolean;
  /** Change handler for GitHub username. */
  onGithubUsernameChange: (value: string) => void;
  /** Change handler for GitHub email. */
  onGithubEmailChange: (value: string) => void;
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
  githubUsername,
  githubEmail,
  overwriteExisting,
  onGithubUsernameChange,
  onGithubEmailChange,
  onOverwriteExistingChange,
}: CommitIdentityProps) {
  return (
    <div className="panel">
      <div className="panel-header">
        <h3>Commit Identity</h3>
        <p>Use the GitHub username and verified email you want credited.</p>
      </div>
      <div className="panel-body">
        <label className="field">
          <span>GitHub username</span>
          <input
            type="text"
            placeholder="octocat"
            value={githubUsername}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onGithubUsernameChange(event.target.value)
            }
          />
        </label>
        <label className="field">
          <span>GitHub email</span>
          <input
            type="email"
            placeholder="octocat@users.noreply.github.com"
            value={githubEmail}
            onChange={(event: ChangeEvent<HTMLInputElement>) =>
              onGithubEmailChange(event.target.value)
            }
          />
        </label>
        <span className="helper-text">
          These values are used for commit authorship and the push command preview.
        </span>
        <label className="checkbox-field">
          <input
            type="checkbox"
            checked={overwriteExisting}
            onChange={(event) => onOverwriteExistingChange(event.target.checked)}
          />
          <span>Replace existing repository on generate</span>
        </label>
        <span className="helper-text">
          Recommended when changing GitHub identity, so old commits are removed.
        </span>
      </div>
    </div>
  );
}
