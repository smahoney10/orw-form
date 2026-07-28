import { useState } from 'react';
import * as XLSX from 'xlsx';
import { runBoxValidation } from '../services/boxValidation';
import { parseAttestations, parseDefinitions, parseMetricData, parseSettings } from '../services/spreadsheetParser';

function UploadValidationPage({ onBack }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] || null);
    setError('');
    setResult(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!file) {
      setError('Please choose a spreadsheet file first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true });

      const sheetNames = workbook.SheetNames || [];
      const sheetMap = {};

      sheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        sheetMap[sheetName] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
      });

      const attestationsData = parseAttestations(sheetMap['CMS Attestations'] || sheetMap[sheetNames[0]] || []);
      const definitionsData = parseDefinitions(sheetMap['Metric Definitions'] || []);
      const metricData = parseMetricData(sheetMap['Metric Data'] || []);
      const settings = parseSettings(sheetMap['Settings'] || sheetMap[sheetNames[0]] || []);

      const boxValidation = runBoxValidation(definitionsData, metricData, attestationsData, settings);
      const standardIssues = [];
      if (!settings.stateAbbreviation) {
        standardIssues.push('State Abbreviation is required');
      } else if (settings.stateAbbreviation.length !== 2) {
        standardIssues.push('State Abbreviation must be exactly 2 characters');
      }

      const allIssues = [
        ...standardIssues,
        ...boxValidation.prechecks,
        ...boxValidation.checks,
        ...boxValidation.attestationChecks,
      ];

      setResult({
        fileName: file.name,
        sheetNames,
        settings,
        attestationsData,
        definitionsData,
        metricData,
        prechecks: boxValidation.prechecks,
        checks: boxValidation.checks,
        attestationChecks: boxValidation.attestationChecks,
        standardIssues,
        allIssues,
      });
    } catch (err) {
      setError(err.message || 'Unable to read the spreadsheet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="box-import-page">
      <div className="box-import-card">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to form
        </button>

        <h2>Spreadsheet validation</h2>
        <p>
          Upload a spreadsheet and run the Box validation checks, prechecks, and attestation checks against it.
        </p>

        <form onSubmit={handleSubmit} className="upload-validation-form">
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileChange} />
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Validating...' : 'Run validation'}
          </button>
        </form>

        {error ? <div className="field-error">{error}</div> : null}

        {result ? (
          <div className="upload-validation-results">
            <h3>Validation summary</h3>
            <p>
              <strong>File:</strong> {result.fileName}
            </p>
            <p>
              <strong>Status:</strong> {result.allIssues.length === 0 ? 'Compliant' : 'Not compliant'}
            </p>
            <p>
              <strong>Sheets detected:</strong> {result.sheetNames.join(', ') || 'None'}
            </p>

            <div className="validation-section">
              <h4>Standard issues</h4>
              {result.standardIssues.length > 0 ? (
                <ul>
                  {result.standardIssues.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-errors">No standard issues found.</p>
              )}
            </div>

            <div className="validation-section">
              <h4>Prechecks</h4>
              {result.prechecks.length > 0 ? (
                <ul>
                  {result.prechecks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-errors">No precheck issues found.</p>
              )}
            </div>

            <div className="validation-section">
              <h4>Attestation checks</h4>
              {result.attestationChecks.length > 0 ? (
                <ul>
                  {result.attestationChecks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-errors">No attestation issues found.</p>
              )}
            </div>

            <div className="validation-section">
              <h4>Checks 1-39</h4>
              {result.checks.length > 0 ? (
                <ul>
                  {result.checks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : (
                <p className="no-errors">No rule issues found.</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default UploadValidationPage;
