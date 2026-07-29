import { MODULES, getOutcomeRefsForModule } from '../data/referenceData';

const isBlank = (value) => value === null || value === undefined || String(value).trim() === '';
const rowLabel = (row, index) => `Row ${row.sourceRow || index + 2}`;
const rowNumbers = (rows) => rows.map((row, index) => row.sourceRow || index + 2);
const isNumeric = (value) => !isBlank(value) && Number.isFinite(Number(String(value).trim()));
const isInteger = (value) => isNumeric(value) && Number(String(value).trim()) % 1 === 0;

// Mirrors the checks supplied in box_checks.py. A returned item represents a
// source rule that failed; checks intentionally absent from that file are not run.
export function runBoxValidation(metricDefinitions = [], metricData = [], attestations = [], options = {}) {
  const { fileName = '', sheetNames = [], workbookReadable = true, stateAbbreviation = '' } = options;
  return {
    prechecks: runPrechecks({ metricDefinitions, metricData, attestations, fileName, sheetNames, workbookReadable }),
    checks: runBoxChecks(metricDefinitions, metricData, { stateAbbreviation, fileName }),
    attestationChecks: runAttestationChecks(metricDefinitions, attestations),
  };
}

function runPrechecks({ metricDefinitions, metricData, attestations, fileName, sheetNames, workbookReadable }) {
  const issues = [];
  // Precheck 1
  if (!workbookReadable) issues.push('Precheck 1: File is not in Excel format.');

  // Precheck 2
  const definitionsTabs = sheetNames.filter((name) => name.includes('Metric Definitions') && !name.includes('Checklist'));
  const valuesTabs = sheetNames.filter((name) => (name.includes('Metric Values') || name.includes('Metric Data')) && !name.includes('Checklist'));
  const attestationTabs = sheetNames.filter((name) => name.includes('CMS Attestations'));
  if (definitionsTabs.length === 0) issues.push('Precheck 2: Metric Definitions tab missing');
  if (definitionsTabs.length > 1) issues.push('Precheck 2: More than one Metric Definitions tab in file');
  if (valuesTabs.length === 0) issues.push('Precheck 2: Metric Values/Data tab missing');
  if (valuesTabs.length > 1) issues.push('Precheck 2: More than one Metric Values/Data tab in file');
  if (sheetNames.some((name) => name.includes('Metric Data')) && attestationTabs.length === 0) issues.push('Precheck 2: CMS Attestation tab missing');
  if (sheetNames.some((name) => name.includes('Metric Data')) && attestationTabs.length > 1) issues.push('Precheck 2: More than one CMS Attestation tab in file');

  // Precheck 3
  const dateMatch = fileName.match(/_([^_]+)\.[^.]+$/);
  if (!isValidFilenameDate(dateMatch?.[1])) {
    issues.push('Precheck 3: Date format in filename is invalid');
  }

  // Precheck 5 — the v3 headers used by this application.
  const expectedHeaders = {
    'Metric Definitions': ['Module', 'Related System', 'Outcome/CEF Reference #', 'State-Specific Outcome Description', 'Metric ID', 'Metric Name', 'Metric Description', 'Numerator Description', 'Denominator Description', 'Value Type', 'Metric Reporting Frequency', 'OAPD Metric Status', 'Note'],
    'Metric Data': ['Reporting Date', 'Metric ID', 'Measure Count', 'Measure Count Description', 'Metric Value', 'Numerator', 'Denominator', 'Program Type', 'Internal State Benchmark', 'Comment'],
    'CMS Attestations': ['Module', 'Related System', 'Outcome/CEF Reference #', 'CMS-Required Outcome and CEF Description', 'Outcome/CEF Applicable (Yes/No)', 'Justification for "No"'],
  };
  const providedHeaders = optionsHeaders(sheetNames, metricDefinitions, metricData, attestations);
  const missing = Object.entries(expectedHeaders).flatMap(([sheet, headers]) =>
    (providedHeaders[sheet] || []).length === 0 ? [] : headers.filter((header) => !providedHeaders[sheet].includes(normalizeHeader(header)))
  );
  if (missing.length > 0) issues.push(`Precheck 5: column names incorrect. File is missing the following columns: ${missing.join(', ')}`);

  // Precheck 6
  const emptyTabs = [];
  if (!metricDefinitions.length) emptyTabs.push('Metric Definitions');
  if (!metricData.length) emptyTabs.push('Metric Data');
  if (emptyTabs.length) issues.push(`Precheck 6: Empty tab(s). File has zero rows of data on the following tab(s): ${emptyTabs.join(', ')}`);
  return issues;
}

// UploadValidationPage supplies the raw headers on the parsed collections.
function optionsHeaders(sheetNames, metricDefinitions, metricData, attestations) {
  const headersFor = (rows) => rows.headers || [];
  return {
    'Metric Definitions': headersFor(metricDefinitions),
    'Metric Data': headersFor(metricData),
    'CMS Attestations': headersFor(attestations),
  };
}

function runBoxChecks(definitions, values, { stateAbbreviation, fileName }) {
  const issues = [];
  const missing = (check, rows, property, message) => rows.forEach((row, index) => {
    if (isBlank(row[property])) issues.push(`Check ${check} (${rowLabel(row, index)}): ${message}`);
  });
  missing(1, definitions, 'metricId', 'Metric ID is missing.');
  missing(3, definitions, 'metricName', 'Metric Name is missing.');
  missing(6, definitions, 'metricDescription', 'Metric Description is missing.');
  missing(9, definitions, 'valueType', 'Value Type is missing.');
  missing(22, values, 'metricId', 'Metric ID is missing.');
  missing(24, values, 'measureCount', 'Measure Count is missing.');

  values.forEach((row, index) => {
    if (!isBlank(row.numerator) && !isNumeric(row.numerator)) issues.push(`Check 29 (${rowLabel(row, index)}): Numerator must be numeric.`);
    if (!isBlank(row.denominator) && !isNumeric(row.denominator)) issues.push(`Check 30 (${rowLabel(row, index)}): Denominator must be numeric.`);
    // Python drops nulls before this check, but treats blank strings as invalid.
    if (row.measureCount !== null && row.measureCount !== undefined && !isInteger(row.measureCount)) issues.push(`Check 32 (${rowLabel(row, index)}): Measure Count must be a whole number.`);
  });

  const definedIds = new Set(definitions.filter((row) => !isBlank(row.metricId)).map((row) => row.metricId));
  values.forEach((row, index) => {
    if (!isBlank(row.metricId) && !definedIds.has(row.metricId)) issues.push(`Check 35 (${rowLabel(row, index)}): Metric ID "${row.metricId}" is not defined on the Metric Definitions tab.`);
  });
  missing(37, values, 'programType', 'Program Type is missing.');

  definitions.forEach((row, index) => {
    if (!isBlank(row.metricId) && !MODULES.includes(row.module)) issues.push(`Check 38 (${rowLabel(row, index)}): Module "${row.module || 'blank'}" is not a valid module.`);
  });

  const allIds = values.filter((row) => !isBlank(row.metricId)).map((row) => String(row.metricId));
  if (allIds.some((id) => id.includes('IO'))) {
    const state = stateAbbreviation || stateFromFilename(fileName);
    const required = [`${state}-CR-IOPAA-01.1`, `${state}-CR-IOPAA-01.2`];
    if (!state || required.some((id) => !allIds.includes(id))) issues.push('Check 39: Required IDs [StateAbbreviation]-CR-IOPAA-01.1 and [StateAbbreviation]-CR-IOPAA-01.2 were not reported on the Metric Data tab.');
  }
  return issues;
}

function runAttestationChecks(definitions, attestations) {
  const issues = [];
  const missing = (check, property, message) => attestations.forEach((row, index) => {
    if (isBlank(row[property])) issues.push(`Attestation ${check} (${rowLabel(row, index)}): ${message}`);
  });
  missing(1, 'relatedSystem', 'Related System is missing.');
  missing(2, 'applicable', 'Outcome Applicable is missing.');
  attestations.forEach((row, index) => {
    if (String(row.applicable).trim() === 'No' && isBlank(row.justification)) issues.push(`Attestation 3 (${rowLabel(row, index)}): Justification is required when Outcome Applicable is "No".`);
  });
  if (!attestations.length) issues.push('Attestation 4: CMS Attestations cannot be empty.');

  const expected = new Map();
  definitions.forEach((row) => {
    if (isBlank(row.relatedSystem) || isBlank(row.module)) return;
    getOutcomeRefsForModule(row.module).filter((ref) => !String(ref).toUpperCase().startsWith('CEF')).forEach((ref) => {
      const value = `${String(row.relatedSystem).trim()}:${ref}`;
      expected.set(value.toLowerCase(), value);
    });
  });
  const attested = new Set(attestations.filter((row) => !String(row.outcomeRef || '').trim().toUpperCase().startsWith('CEF'))
    .map((row) => `${String(row.relatedSystem || '').trim()}:${String(row.outcomeRef || '').trim()}`.toLowerCase()));
  const missingOutcomes = [...expected].filter(([key]) => !attested.has(key)).map(([, value]) => value);
  if (missingOutcomes.length) issues.push(`Attestation 5: Missing required outcome attestations: ${missingOutcomes.join(', ')}`);

  const systems = [...new Set(attestations.map((row) => String(row.relatedSystem || '').trim()).filter(Boolean))];
  systems.forEach((system) => {
    const systemRows = attestations.filter((row) => String(row.relatedSystem || '').trim().toLowerCase() === system.toLowerCase());
    const modules = [...new Set(systemRows.map((row) => row.module).filter(Boolean))];
    const hasCompleteCefs = modules.some((module) => {
      const present = new Set(systemRows.filter((row) => row.module === module).map((row) => String(row.outcomeRef || '').trim()));
      return Array.from({ length: 22 }, (_, index) => `CEF${String(index + 1).padStart(2, '0')}`).every((cef) => present.has(cef));
    });
    if (!hasCompleteCefs) issues.push(`Attestation 6: Related System "${system}" does not have a complete set of CEF01 through CEF22 for any module.`);
  });

  const attSystems = [...new Set(attestations.map((row) => String(row.relatedSystem || '').trim()).filter(Boolean))];
  const definitionSystems = [...new Set(definitions.map((row) => String(row.relatedSystem || '').trim()).filter(Boolean))];
  const attNotDef = attSystems.filter((system) => !definitionSystems.some((candidate) => candidate.toLowerCase() === system.toLowerCase()));
  const defNotAtt = definitionSystems.filter((system) => !attSystems.some((candidate) => candidate.toLowerCase() === system.toLowerCase()));
  if (attNotDef.length || defNotAtt.length) issues.push(`Attestation 7: Related Systems differ across tabs. Attestations only: ${attNotDef.join(', ') || 'none'}; Definitions only: ${defNotAtt.join(', ') || 'none'}.`);
  return issues;
}

function normalizeHeader(value) { return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ''); }
function stateFromFilename(fileName) {
  const parts = String(fileName || '').split('_');
  return parts.length >= 3 ? parts[2] : '';
}

function isValidFilenameDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
