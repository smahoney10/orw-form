import test from 'node:test';
import assert from 'node:assert/strict';
import { runBoxValidation } from './boxValidation.js';

test('runs the numbered box checks supplied in box_checks.py', () => {
  const definitions = [{ sourceRow: 2, metricId: 'CA-CR-CP-01.1', metricName: '', metricDescription: '', valueType: '', module: 'Claims Processing', relatedSystem: 'Core' }];
  const values = [{ sourceRow: 2, metricId: 'UNKNOWN', measureCount: '2.5', numerator: 'x', denominator: '', programType: '' }];
  const result = runBoxValidation(definitions, values, [], {
    fileName: 'Operational_Report_CA_CP_2026-01-01.xlsx',
    sheetNames: ['Metric Definitions', 'Metric Data', 'CMS Attestations'],
    stateAbbreviation: 'CA',
  });

  for (const check of [3, 6, 9, 29, 32, 35, 37]) {
    assert.ok(result.checks.some((issue) => issue.startsWith(`Check ${check}`)), `Check ${check} should fail`);
  }
  assert.ok(!result.checks.some((issue) => issue.startsWith('Check 2')));
  assert.ok(!result.checks.some((issue) => issue.startsWith('Check 27')));
  assert.ok(!result.checks.some((issue) => issue.startsWith('Check 28')));
});

test('requires the paired IOPAA IDs when an IO metric is reported', () => {
  const result = runBoxValidation([], [{ metricId: 'CA-CR-IO-01.1', measureCount: 1, numerator: 1, denominator: 1, programType: 'Medicaid' }], [], {
    fileName: 'Operational_Report_CA_CP_2026-01-01.xlsx',
    sheetNames: ['Metric Definitions', 'Metric Data', 'CMS Attestations'],
    stateAbbreviation: 'CA',
  });
  assert.ok(result.checks.some((issue) => issue.startsWith('Check 39')));
});

test('does not run attestation checks while attestation validation is paused', () => {
  const result = runBoxValidation([], [], [{ sourceRow: 2, relatedSystem: 'Core', applicable: 'No', justification: '', module: 'Claims Processing', outcomeRef: 'CP01' }], {
    fileName: 'Operational_Report_CA_CP_2026-01-01.xlsx',
    sheetNames: ['Metric Definitions', 'Metric Data', 'CMS Attestations'],
  });
  assert.deepEqual(result.attestationChecks, []);
});
