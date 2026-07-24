import { useState } from 'react';
import { fetchDatabricksWorkspaceContent, parsePythonCode, tryParseJsonContent } from '../services/databricks';

function DatabricksConnector({ onImport }) {
  const [workspaceHost, setWorkspaceHost] = useState('cms-dataconnect.cloud.databricks.com');
  const [token, setToken] = useState('');
  const [workspacePath, setWorkspacePath] = useState('/Workspace/Users/you@example.com/my-notebook');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setStatus('');

    try {
      const content = await fetchDatabricksWorkspaceContent({
        workspaceHost,
        token,
        path: workspacePath,
      });

      const parsedJson = tryParseJsonContent(content);
      const pythonCode = parsePythonCode(content);

      if (parsedJson) {
        onImport(parsedJson);
        setStatus('Imported JSON data from Databricks.');
        return;
      }

      if (pythonCode) {
        onImport({ pythonCode, importedFrom: 'databricks' });
        setStatus('Imported Python code from Databricks.');
        return;
      }

      throw new Error('The Databricks export did not contain usable content.');
    } catch (err) {
      setError(err.message || 'Unable to load content from Databricks.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="settings-panel" style={{ marginTop: '16px' }}>
      <div className="settings-header">
        <div>
          <h3>Databricks Import</h3>
          <div className="settings-summary">Load JSON data exported from a Databricks workspace path.</div>
        </div>
      </div>
      <div className="settings-body">
        <form onSubmit={handleSubmit} className="settings-row" style={{ flexDirection: 'column', gap: '10px' }}>
          <div className="settings-field">
            <label htmlFor="workspaceHost">Workspace host or URL</label>
            <input
              id="workspaceHost"
              value={workspaceHost}
              onChange={(event) => setWorkspaceHost(event.target.value)}
              placeholder="https://cms-dataconnect.cloud.databricks.com"
            />
          </div>

          <div className="settings-field">
            <label htmlFor="workspacePath">Workspace path</label>
            <input
              id="workspacePath"
              value={workspacePath}
              onChange={(event) => setWorkspacePath(event.target.value)}
              placeholder="/Workspace/Users/you@example.com/my-file"
            />
          </div>

          <div className="settings-field">
            <label htmlFor="token">Personal access token</label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Enter token"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Import from Databricks'}
            </button>
            <span className="settings-summary">Use a token from your Databricks profile. For the workspace link you shared, paste the full URL in the host field and provide the exact Databricks workspace path in the path field.</span>
          </div>

          {error ? <div className="field-error">{error}</div> : null}
          {status ? <div className="settings-summary">{status}</div> : null}
        </form>
      </div>
    </section>
  );
}

export default DatabricksConnector;
