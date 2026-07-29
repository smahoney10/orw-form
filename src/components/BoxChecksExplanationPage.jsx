import { useState } from 'react';
import { fetchDatabricksWorkspaceContent } from '../services/databricks';
import { extractBoxCheckDescriptions } from '../services/boxChecksParser';

function BoxChecksExplanationPage({ onBack }) {
  const [workspaceHost, setWorkspaceHost] = useState('cms-dataconnect.cloud.databricks.com');
  const [workspacePath, setWorkspacePath] = useState('/Workspace/Users/you@example.com/box_checks.py');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sourceContent, setSourceContent] = useState('');
  const [parsedChecks, setParsedChecks] = useState([]);

  const handleImport = async () => {
    if (!workspaceHost || !workspacePath || !token) {
      setError('Please provide the workspace host, workspace path, and token.');
      return;
    }

    setLoading(true);
    setError('');
    setSourceContent('');
    setParsedChecks([]);

    try {
      const content = await fetchDatabricksWorkspaceContent({ workspaceHost, token, path: workspacePath });
      const extracted = extractBoxCheckDescriptions(content);
      setSourceContent(content);
      setParsedChecks(extracted);
    } catch (err) {
      setError(err.message || 'Unable to load the file from Databricks.');
    } finally {
      setLoading(false);
    }
  };

  const sections = [
    {
      title: 'Checks 1 through 39',
      description: 'The following items reflect the rule-style wording used in the Box validation module.',
      bullets: [
        'Check 1: Is a Metric ID missing for any metric?',
        'Check 2: Is a Metric Name missing for any metric?',
        'Check 3: Is a Metric Description missing for any metric?',
        'Check 4: Is a Metric Definition Module missing for any metric?',
        'Check 5: Is a Metric Definition Related System missing for any metric?',
        'Check 6: Is a Metric Definition Outcome Ref missing for any metric?',
        'Check 7: Is a Metric Definition Value Type missing for any metric?',
        'Check 8: Is a Metric Definition Frequency missing for any metric?',
        'Check 9: Is a Metric Definition Status missing for any metric?',
        'Check 10: Is a Metric Definition Numerator Desc missing for any metric?',
        'Check 11: Is a Metric Definition Denominator Desc missing for any metric?',
        'Check 12: Is a Metric Definition Note missing for any metric?',
        'Check 13: Is a Metric Data Reporting Date missing for any metric data row?',
        'Check 14: Is a Metric Data Metric ID missing for any metric data row?',
        'Check 15: Is a Metric Data Program Type missing for any metric data row?',
        'Check 16: Is a Metric Data Metric Value missing for any metric data row?',
        'Check 17: Is a Metric Data Comment missing for any metric data row?',
        'Check 18: Is a Metric Data Date in the future for any metric data row?',
        'Check 19: Is an Attestation Related System missing for any attestation?',
        'Check 20: Is an Attestation Applicable missing for any attestation?',
        'Check 21: Is an Attestation Justification missing for any attestation?',
        'Check 22: Is a Metric Definition Duplicate Metric ID present for any metric?',
        'Check 23: Is a Metric Definition Module missing for any metric?',
        'Check 24: Is a Metric Definition Related System missing for any metric?',
        'Check 25: Is a Metric Definition Outcome Ref missing for any metric?',
        'Check 26: Is a Metric Definition Metric Name missing for any metric?',
        'Check 27: Is a Metric Definition Metric Description missing for any metric?',
        'Check 28: Is a Metric Definition Value Type missing for any metric?',
        'Check 29: Is a Metric Definition Frequency missing for any metric?',
        'Check 30: Is a Metric Definition Status missing for any metric?',
        'Check 31: Is a Metric Definition Numerator Desc missing for any percentage metric?',
        'Check 32: Is a Metric Definition Denominator Desc missing for any percentage metric?',
        'Check 33: Is a Metric Definition Duplicate Metric ID present for any metric?',
        'Check 34: Is an Attestation Related System missing for any attestation?',
        'Check 35: Is an Attestation Applicable missing for any attestation?',
        'Check 36: Is an Attestation Justification missing for any attestation?',
        'Check 37: Is a Metric Data Reporting Date missing for any metric data row?',
        'Check 38: Is a Metric Data Metric ID missing for any metric data row?',
        'Check 39: Is a Metric Data Program Type missing for any metric data row?',
      ],
    },
    {
      title: 'Each attestation',
      description: 'Every attestation row is checked to make sure it contains a usable response, the right supporting context, and any required justification. These checks prevent incomplete or ambiguous attestations from being accepted.',
      bullets: [
        'Is an Attestation Related System missing for any attestation?',
        'Is an Attestation Applicable missing for any attestation?',
        'Is an Attestation Justification missing for any attestation?',
      ],
    },
    {
      title: 'Each precheck',
      description: 'The prechecks run first and catch missing or inconsistent values before the full validation flow continues. They are meant to stop defective records early.',
      bullets: [
        'Is a required value missing before the record proceeds?',
        'Is module, metric, outcome, or system information incomplete?',
        'Is narrative text or justification missing where required?',
        'Is the record blocked from downstream processing because it is incomplete?',
      ],
    },
    {
      title: 'How the versioned files fit together',
      description: 'The versioned Box check modules are successive implementations of the same validation concept. Each version can refine the existing checks, add new ones, or adjust logic while preserving the same purpose.',
      bullets: [
        'box_checks.py provides the core validation behavior.',
        'box_checks_V1.py adds the first refinement layer.',
        'box_checks_V2.py introduces the next expansion of the logic.',
        'box_checks_V3.py carries the latest refinement or edge-case handling.',
      ],
    },
  ];

  return (
    <div className="box-import-page">
      <div className="box-import-card">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to form
        </button>

        <h2>Box checks explanation</h2>
        <p>
          This page is intended to explain the validation logic in the Box import Python files.
          The files referenced below are expected to live in the Box import folder for this project.
        </p>

        <div className="settings-panel" style={{ marginBottom: '16px' }}>
          <div className="settings-field">
            <label htmlFor="workspaceHost">Databricks workspace host</label>
            <input
              id="workspaceHost"
              value={workspaceHost}
              onChange={(event) => setWorkspaceHost(event.target.value)}
              placeholder="cms-dataconnect.cloud.databricks.com"
            />
          </div>
          <div className="settings-field">
            <label htmlFor="workspacePath">Workspace path to box_checks.py</label>
            <input
              id="workspacePath"
              value={workspacePath}
              onChange={(event) => setWorkspacePath(event.target.value)}
              placeholder="/Workspace/Users/you@example.com/box_checks.py"
            />
          </div>
          <div className="settings-field">
            <label htmlFor="token">Databricks token</label>
            <input
              id="token"
              type="password"
              value={token}
              onChange={(event) => setToken(event.target.value)}
              placeholder="Bearer token or PAT"
            />
          </div>
          <button className="btn btn-primary" type="button" onClick={handleImport} disabled={loading}>
            {loading ? 'Loading...' : 'Load checks from Databricks'}
          </button>
          {error ? <div className="field-error">{error}</div> : null}
        </div>

        {parsedChecks.length > 0 ? (
          <div style={{ marginBottom: '16px' }}>
            <h3>Checks found in the Databricks file</h3>
            <ul>
              {parsedChecks.map((check) => (
                <li key={check}>{check}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {sections.map((section) => (
          <div key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
            <ul>
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoxChecksExplanationPage;
