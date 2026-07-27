import { useEffect, useState } from 'react';
import { fetchDatabricksWorkspaceContent, parsePythonCode, tryParseJsonContent } from '../services/databricks';
import { clearDatabricksToken, extractHashToken, getDatabricksOAuthUrl, loadDatabricksToken, saveDatabricksToken } from '../services/databricksOAuth';

function DatabricksConnector({ onImport }) {
  const [workspaceHost, setWorkspaceHost] = useState('cms-dataconnect.cloud.databricks.com');
  const [token, setToken] = useState('');
  const [workspacePath, setWorkspacePath] = useState('/Workspace/Users/you@example.com/my-notebook');
  const [clientId, setClientId] = useState('');
  const [redirectUri, setRedirectUri] = useState('http://localhost:5173');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    const storedToken = loadDatabricksToken();
    if (storedToken) {
      setToken(storedToken);
    }

    const hashToken = extractHashToken(window.location.hash);
    if (hashToken) {
      setToken(hashToken);
      saveDatabricksToken(hashToken);
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
  }, []);

  const handleOAuthLogin = () => {
    try {
      const authUrl = getDatabricksOAuthUrl({ workspaceHost, clientId, redirectUri });
      window.open(authUrl, '_blank', 'noopener,noreferrer');
      setStatus('Open the Databricks sign-in window and complete authentication.');
    } catch (err) {
      setError(err.message || 'Unable to start Databricks sign-in.');
    }
  };

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
            <label htmlFor="clientId">OAuth client ID</label>
            <input
              id="clientId"
              value={clientId}
              onChange={(event) => setClientId(event.target.value)}
              placeholder="Databricks OAuth app client ID"
            />
          </div>

          <div className="settings-field">
            <label htmlFor="redirectUri">Redirect URI</label>
            <input
              id="redirectUri"
              value={redirectUri}
              onChange={(event) => setRedirectUri(event.target.value)}
              placeholder="http://localhost:5173"
            />
          </div>

          <div className="settings-field">
            <label htmlFor="token">Databricks access token</label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Enter bearer token or PAT"
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" type="button" onClick={handleOAuthLogin}>
              Sign in with Databricks
            </button>
            <button className="btn btn-primary" type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'Import from Databricks'}
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => { clearDatabricksToken(); setToken(''); setStatus('Cleared saved token.'); }}>
              Clear token
            </button>
          </div>

          {error ? <div className="field-error">{error}</div> : null}
          {status ? <div className="settings-summary">{status}</div> : null}
        </form>
      </div>
    </section>
  );
}

export default DatabricksConnector;
