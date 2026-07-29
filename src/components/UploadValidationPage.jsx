import { useState } from 'react';
import * as XLSX from 'xlsx';
import { runBoxValidation } from '../services/boxValidation';
import { parseAttestations, parseDefinitions, parseMetricData, parseSettings } from '../services/spreadsheetParser';

function normalizeHeader(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function getSheetDataRows(worksheet, candidateHeaders = []) {
  if (!worksheet) return [];

  const rawRows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  if (!Array.isArray(rawRows) || rawRows.length === 0) return [];

  const candidateRows = rawRows.slice(0, 2).map((row, index) => ({ row, index }));
  const headerCandidateIndex = candidateRows.findIndex(({ row }) =>
    row.some((cell) => candidateHeaders.some((candidate) => normalizeHeader(cell) === normalizeHeader(candidate)))
  );

  const selectedHeaderIndex = headerCandidateIndex >= 0 ? candidateRows[headerCandidateIndex].index : 0;
  const headerRow = rawRows[selectedHeaderIndex] || [];

  const dataRows = rawRows
    .slice(selectedHeaderIndex + 1)
    .filter((row) => Array.isArray(row) && row.some((cell) => String(cell ?? '').trim() !== ''))
    .map((row, rowIndex) => {
      const dataRow = {};
      headerRow.forEach((header, index) => {
        dataRow[String(header)] = row[index] ?? '';
      });
      dataRow.__rowNumber = selectedHeaderIndex + rowIndex + 2;
      return dataRow;
    });
  dataRows.headers = headerRow.map(normalizeHeader);
  return dataRows;
}

function getStateAbbreviationFromFileName(fileName) {
  const match = String(fileName || '').match(/^Operational_Report_([A-Za-z]{2})_/i);
  return match ? match[1].toUpperCase() : '';
}

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

      const attestationRows = getSheetDataRows(
        workbook.Sheets['CMS Attestations'] || workbook.Sheets[sheetNames[0]], [
          'module',
          'related system',
          'outcome cef reference',
          'applicable',
          'justification',
        ]
      );
      const definitionRows = getSheetDataRows(
        workbook.Sheets['Metric Definitions'] || workbook.Sheets[sheetNames[0]], [
          'module',
          'related system',
          'outcome cef reference',
          'metric id',
          'metric name',
        ]
      );
      const metricRows = getSheetDataRows(
        workbook.Sheets['Metric Data'] || workbook.Sheets['Metric Values'] || workbook.Sheets[sheetNames[0]], [
          'reporting date',
          'metric id',
          'metric value',
        ]
      );
      const settingsRows = getSheetDataRows(
        workbook.Sheets['Settings'] || workbook.Sheets[sheetNames[0]], [
          'state abbreviation',
          'state name',
        ]
      );
      const attestationsData = parseAttestations(attestationRows);
      const definitionsData = parseDefinitions(definitionRows);
      const metricData = parseMetricData(metricRows, definitionsData);
      const parsedSettings = parseSettings(settingsRows);
      const settings = {
        ...parsedSettings,
        stateAbbreviation: parsedSettings.stateAbbreviation || getStateAbbreviationFromFileName(file.name),
      };
      attestationsData.headers = attestationRows.headers || [];
      definitionsData.headers = definitionRows.headers || [];
      metricData.headers = metricRows.headers || [];

      const boxValidation = runBoxValidation(definitionsData, metricData, attestationsData, {
        fileName: file.name,
        sheetNames,
        workbookReadable: /\.(xlsx|xls)$/i.test(file.name),
        stateAbbreviation: settings.stateAbbreviation,
      });
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
          <label htmlFor="workbook-upload">Choose an ORW Excel workbook</label>
          <input id="workbook-upload" type="file" accept=".xlsx,.xls" onChange={handleFileChange} />
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
              <h4>Box business checks</h4>
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

            <div className="validation-section">
              <h4>Attestation checks</h4>
              {result.attestationChecks.length > 0 ? (
                <ul>{result.attestationChecks.map((item) => <li key={item}>{item}</li>)}</ul>
              ) : <p className="no-errors">No attestation issues found.</p>}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default UploadValidationPage;
