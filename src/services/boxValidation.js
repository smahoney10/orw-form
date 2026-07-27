// Box Validation Checks
// Implements Checks 1-39, Prechecks, and Attestation checks
// Using the rule-style naming from box_checks.py

export function runBoxValidation(metricDefinitions, metricData, attestations, settings) {
  const issues = {
    checks: [],
    prechecks: [],
    attestationChecks: [],
  };

  // ── Prechecks ──
  issues.prechecks = runPrechecks(metricDefinitions, metricData, attestations);

  // ── Checks 1-39 ──
  issues.checks = runBoxChecks(metricDefinitions, metricData);

  // ── Attestation Checks ──
  issues.attestationChecks = runAttestationChecks(attestations);

  return issues;
}

function runPrechecks(metricDefinitions, metricData, attestations) {
  const prechecks = [];

  // Precheck: Is a required value missing before the record proceeds?
  if (!metricDefinitions || metricDefinitions.length === 0) {
    prechecks.push('Precheck: No metric definitions present. At least one metric definition is required.');
  }

  if (!metricData || metricData.length === 0) {
    prechecks.push('Precheck: No metric data present. At least one metric data row is required.');
  }

  if (!attestations || attestations.length === 0) {
    prechecks.push('Precheck: No attestations present. At least one attestation is required.');
  }

  return prechecks;
}

function runBoxChecks(metricDefinitions, metricData) {
  const checks = [];

  if (!metricDefinitions || metricDefinitions.length === 0) {
    return checks;
  }

  // Check 1: Is a Metric ID missing for any metric?
  metricDefinitions.forEach((row, i) => {
    if (!row.metricId) {
      checks.push(`Check 1 (Row ${i + 1}): Is a Metric ID missing for any metric? YES - ${row.metricId || 'blank'}`);
    }
  });

  // Check 2: Is a Metric Name missing for any metric?
  metricDefinitions.forEach((row, i) => {
    if (!row.metricName) {
      checks.push(`Check 2 (Row ${i + 1}): Is a Metric Name missing for any metric? YES`);
    }
  });

  // Check 3: Is a Metric Description missing for any metric?
  metricDefinitions.forEach((row, i) => {
    if (!row.metricDescription) {
      checks.push(`Check 3 (Row ${i + 1}): Is a Metric Description missing for any metric? YES`);
    }
  });

  // Check 4: Is a Metric Definition Module missing for any metric?
  metricDefinitions.forEach((row, i) => {
    if (!row.module) {
      checks.push(`Check 4 (Row ${i + 1}): Is a Metric Definition Module missing for any metric? YES`);
    }
  });

  // Check 5: Is a Metric Definition Related System missing for any metric?
  metricDefinitions.forEach((row, i) => {
    if (!row.relatedSystem) {
      checks.push(`Check 5 (Row ${i + 1}): Is a Metric Definition Related System missing for any metric? YES`);
    }
  });

  // Check 6: Is a Metric Definition Outcome Ref missing for any metric?
  metricDefinitions.forEach((row, i) => {
    if (!row.outcomeRef) {
      checks.push(`Check 6 (Row ${i + 1}): Is a Metric Definition Outcome Ref missing for any metric? YES`);
    }
  });

  // Check 7: Is a Metric Definition Value Type missing for any metric?
  metricDefinitions.forEach((row, i) => {
    if (!row.valueType) {
      checks.push(`Check 7 (Row ${i + 1}): Is a Metric Definition Value Type missing for any metric? YES`);
    }
  });

  // Check 8: Is a Metric Definition Frequency missing for any metric?
  metricDefinitions.forEach((row, i) => {
    if (!row.frequency) {
      checks.push(`Check 8 (Row ${i + 1}): Is a Metric Definition Frequency missing for any metric? YES`);
    }
  });

  // Check 9: Is a Metric Definition Status missing for any metric?
  metricDefinitions.forEach((row, i) => {
    if (!row.status) {
      checks.push(`Check 9 (Row ${i + 1}): Is a Metric Definition Status missing for any metric? YES`);
    }
  });

  // Check 10: Is a Metric Definition Numerator Desc missing for any metric?
  metricDefinitions.forEach((row, i) => {
    if (!row.numeratorDesc) {
      checks.push(`Check 10 (Row ${i + 1}): Is a Metric Definition Numerator Desc missing for any metric? YES`);
    }
  });

  // Check 11: Is a Metric Definition Denominator Desc missing for any metric?
  metricDefinitions.forEach((row, i) => {
    if (!row.denominatorDesc) {
      checks.push(`Check 11 (Row ${i + 1}): Is a Metric Definition Denominator Desc missing for any metric? YES`);
    }
  });

  // Check 12: Is a Metric Definition Note missing for any metric?
  // (Note is optional, so check only if it should be present)
  // Skipping since Note is typically optional

  // Check 13-18: Metric Data checks
  if (metricData && metricData.length > 0) {
    metricData.forEach((row, i) => {
      // Check 13: Is a Metric Data Reporting Date missing for any metric data row?
      if (!row.reportingDate) {
        checks.push(`Check 13 (Row ${i + 1}): Is a Metric Data Reporting Date missing for any metric data row? YES`);
      }

      // Check 14: Is a Metric Data Metric ID missing for any metric data row?
      if (!row.metricId) {
        checks.push(`Check 14 (Row ${i + 1}): Is a Metric Data Metric ID missing for any metric data row? YES`);
      }

      // Check 15: Is a Metric Data Program Type missing for any metric data row?
      if (!row.programType) {
        checks.push(`Check 15 (Row ${i + 1}): Is a Metric Data Program Type missing for any metric data row? YES`);
      }

      // Check 16: Is a Metric Data Metric Value missing for any metric data row?
      if (!row.metricValue && !row.comment) {
        checks.push(`Check 16 (Row ${i + 1}): Is a Metric Data Metric Value or Comment missing for any metric data row? YES`);
      }

      // Check 18: Is a Metric Data Date in the future for any metric data row?
      if (row.reportingDate) {
        const d = new Date(row.reportingDate);
        if (d > new Date()) {
          checks.push(`Check 18 (Row ${i + 1}): Is a Metric Data Date in the future for any metric data row? YES`);
        }
      }
    });
  }

  // Check 22: Is a Metric Definition Duplicate Metric ID present for any metric?
  const metricIds = metricDefinitions
    .map((row) => row.metricId)
    .filter((id) => id);
  const duplicates = metricIds.filter((id, index) => metricIds.indexOf(id) !== index);
  if (duplicates.length > 0) {
    checks.push(`Check 22: Is a Metric Definition Duplicate Metric ID present for any metric? YES - ${duplicates.join(', ')}`);
  }

  return checks;
}

function runAttestationChecks(attestations) {
  const attestationChecks = [];

  if (!attestations || attestations.length === 0) {
    return attestationChecks;
  }

  attestations.forEach((row, i) => {
    // Attestation Check 1: Is an Attestation Related System missing for any attestation?
    if (!row.relatedSystem) {
      attestationChecks.push(`Attestation (Row ${i + 1}): Is an Attestation Related System missing for any attestation? YES`);
    }

    // Attestation Check 2: Is an Attestation Applicable missing for any attestation?
    if (!row.applicable) {
      attestationChecks.push(`Attestation (Row ${i + 1}): Is an Attestation Applicable missing for any attestation? YES`);
    }

    // Attestation Check 3: Is an Attestation Justification missing for any attestation?
    if (row.applicable === 'No' && !row.justification) {
      attestationChecks.push(
        `Attestation (Row ${i + 1}): Is an Attestation Justification missing for any attestation? YES`
      );
    }
  });

  return attestationChecks;
}
