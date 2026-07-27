import { useState } from 'react';
import { fetchGitFileContent } from '../services/gitImport';
import { parsePythonCode } from '../services/databricks';

function GitImportPanel({ onImport }) {
  const [repoUrl, setRepoUrl] = useState('https://github.com/owner/repo');
  const [filePath, setFilePath] = useState('path/to/file.py');
  const [branch, setBranch] = useState('main');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');

    try {
      const content = await fetchGitFileContent({ repoUrl, filePath, branch });
      const pythonCode = parsePythonCode(content);

      if (!pythonCode) {
        throw new Error('The file did not contain any readable content.');
      }

      onImport({ pythonCode, importedFrom: 'git' });
      setStatus('Imported Python code from Git repository.');
    } catch (err) {
      setError(err.message || 'Unable to import from Git repository.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="settings-panel" style={{ marginTop: '16px' }}>
      <div className="settings-header">
        <div>
          <h3>Git Import</h3>
          <div className="settings-summary">Load Python source from a GitHub or GitLab repository file.</div>
        </div>
      </div>
      <div className="settings-body">
        <form onSubmit={handleSubmit} className="settings-row" style={{ flexDirection: 'column', gap: '10px' }}>
          <div className="settings-field">
            <label htmlFor="repoUrl">Repository URL</label>
            <input
              id="repoUrl"
              value={repoUrl}
              onChange={(event) => setRepoUrl(event.target.value)}
              placeholder="https://github.com/owner/repo"
            />
          </div>

          <div className="settings-field">
            <label htmlFor="filePath">File path</label>
            <input
              id="filePath"
              value={filePath}
              onChange={(event) => setFilePath(event.target.value)}
              placeholder="path/to/file.py"
            />
          </div>

          <div className="settings-field">
            <label htmlFor="branch">Branch</label>
            <input
              id="branch"
              value={branch}
              onChange={(event) => setBranch(event.target.value)}
              placeholder="main"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Import from Git'}
            </button>
          </div>

          {error ? <div className="field-error">{error}</div> : null}
          {status ? <div className="settings-summary">{status}</div> : null}
        </form>
      </div>
    </section>
  );
}

export default GitImportPanel;
