function normalizeHeader(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function getValue(row, candidates) {
  if (!row) return '';

  const normalizedRow = Object.entries(row).reduce((acc, [key, value]) => {
    acc[normalizeHeader(key)] = value;
    return acc;
  }, {});

  for (const candidate of candidates) {
    const key = normalizeHeader(candidate);
    if (normalizedRow[key] !== undefined && normalizedRow[key] !== '') {
      return normalizedRow[key];
    }
  }

  return '';
}

export function parseAttestations(rows) {
  return (rows || []).map((row) => ({
    module: getValue(row, ['module']),
    relatedSystem: getValue(row, ['related system', 'related_system', 'relatedsystem', 'related system required', 'Related System (Required)']),
    outcomeRef: getValue(row, ['outcome cef reference', 'outcome/cef reference #', 'outcome_ref','Outcome/CEF Applicable (Yes/No) ']),
    outcomeDesc: getValue(row, ['cms-required outcome and cef description', 'outcome description']),
    applicable: getValue(row, ['applicable', 'applicable yes/no', 'applicable selection', 'outcome/cef applicable yes/no']),
    justification: getValue(row, ['justification', 'justification for no']),
  }));
}

export function parseDefinitions(rows) {
  return (rows || []).map((row) => ({
    module: getValue(row, ['module']),
    relatedSystem: getValue(row, ['related system', 'related_system', 'relatedsystem', 'related system required']),
    outcomeRef: getValue(row, ['outcome cef reference', 'outcome/cef reference #', 'outcome_ref']),
    stateSpecificDesc: getValue(row, ['state-specific outcome description', 'state specific desc']),
    metricId: getValue(row, ['metric id', 'metricid']),
    metricName: getValue(row, ['metric name', 'metricname']),
    metricDescription: getValue(row, ['metric description', 'metricdescription']),
    numeratorDesc: getValue(row, ['numerator description', 'numeratordesc']),
    denominatorDesc: getValue(row, ['denominator description', 'denominatordesc']),
    valueType: getValue(row, ['value type', 'valuetype']),
    frequency: getValue(row, ['metric reporting frequency', 'frequency']),
    status: getValue(row, ['oapd metric status', 'status']),
    note: getValue(row, ['note']),
  }));
}

export function parseMetricData(rows) {
  return (rows || []).map((row) => ({
    reportingDate: getValue(row, ['reporting date', 'reportingdate']),
    metricId: getValue(row, ['metric id', 'metricid']),
    measureCount: getValue(row, ['measure count', 'measurecount']),
    measureCountDesc: getValue(row, ['measure count description', 'measurecountdesc']),
    metricValue: getValue(row, ['metric value', 'metricvalue']),
    numerator: getValue(row, ['numerator']),
    denominator: getValue(row, ['denominator']),
    programType: getValue(row, ['program type', 'programtype']),
    benchmark: getValue(row, ['internal state benchmark', 'benchmark']),
    comment: getValue(row, ['comment']),
  }));
}

export function parseSettings(rows) {
  const firstRow = rows?.[0] || {};
  return {
    stateAbbreviation: getValue(firstRow, ['state abbreviation', 'stateabbreviation', 'state_abbreviation']),
    stateName: getValue(firstRow, ['state name', 'statename']),
  };
}
