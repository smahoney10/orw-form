import test from 'node:test';
import assert from 'node:assert/strict';
import { parseAttestations, parseDefinitions, parseMetricData, parseSettings } from './spreadsheetParser.js';

test('parses attestation headers with required suffixes and punctuation', () => {
  const rows = [
    {
      'Module': 'Module A',
      'Related System\n(Required)': 'System 1',
      'Outcome/\nCEF Reference #': 'REF-1',
      'CMS-Required Outcome and CEF Description': 'Outcome desc',
      'Outcome/CEF Applicable (Yes/No)': 'Yes',
      'Justification for "No"': 'N/A',
    },
  ];

  const parsed = parseAttestations(rows);
  assert.equal(parsed[0].relatedSystem, 'System 1');
  assert.equal(parsed[0].applicable, 'Yes');
  assert.equal(parsed[0].justification, 'N/A');
});

test('treats whitespace-only values as empty', () => {
  const rows = [{ 'Related System\n(Required)': '   ' }];
  const parsed = parseAttestations(rows);
  assert.equal(parsed[0].relatedSystem, '');
});

test('parses metric definition headers with required suffixes and punctuation', () => {
  const rows = [
    {
      'Module': 'Module A',
      'Related System\n(Required)': 'System 2',
      'Outcome/\nCEF Reference #': 'REF-2',
      'State-Specific Outcome Description': 'State desc',
      'Metric ID': 'M-1',
      'Metric Name': 'Metric 1',
      'Metric Description': 'Desc',
      'Numerator Description': 'Num',
      'Denominator Description': 'Den',
      'Value Type': 'Type',
      'Metric Reporting Frequency': 'Monthly',
      'OAPD Metric Status': 'Active',
      'Note': 'Note',
    },
  ];

  const parsed = parseDefinitions(rows);
  assert.equal(parsed[0].relatedSystem, 'System 2');
  assert.equal(parsed[0].metricId, 'M-1');
});

test('parses metric data and settings headers', () => {
  const metricRows = [
    {
      'Reporting Date': '2024-01-01',
      'Metric ID': 'M-1',
      'Measure Count': '10',
      'Measure Count Description': 'Count desc',
      'Metric Value': '100',
      'Numerator': '50',
      'Denominator': '50',
      'Program Type': 'Type',
      'Internal State Benchmark': '75',
      'Comment': 'ok',
    },
  ];
  const settingsRows = [
    {
      'State Abbreviation': 'CA',
      'State Name': 'California',
    },
  ];

  const parsedMetrics = parseMetricData(metricRows);
  const parsedSettings = parseSettings(settingsRows);
  assert.equal(parsedMetrics[0].metricId, 'M-1');
  assert.equal(parsedMetrics[0].programType, 'Type');
  assert.equal(parsedSettings.stateAbbreviation, 'CA');
});

test('parses the V3 Program Type (Required) header', () => {
  const parsed = parseMetricData([{ 'Program Type (Required)': 'Medicaid' }]);
  assert.equal(parsed[0].programType, 'Medicaid');
});
