function normalizeHeader(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9]+/g, '')
    .trim();
}

function buildHeaderMap(row) {
  if (!row) return {};

  return Object.entries(row).reduce((acc, [key, value]) => {
    acc[normalizeHeader(key)] = value;
    return acc;
  }, {});
}

function getValue(row, candidates) {
  if (!row) return '';

  const normalizedRow = buildHeaderMap(row);

  for (const candidate of candidates) {
    const key = normalizeHeader(candidate);
    const rawValue = normalizedRow[key];

    if (rawValue === undefined) continue;

    if (typeof rawValue === 'string') {
      const trimmed = rawValue.trim();
      if (trimmed !== '') return trimmed;
      continue;
    }

    if (rawValue !== '' && rawValue !== null && rawValue !== undefined) {
      return rawValue;
    }
  }

  return '';
}

function getValueFromRow(row, candidates) {
  return getValue(row, candidates);
}

export function parseAttestations(rows) {
  return (rows || []).map((row) => ({
    module: getValueFromRow(row, ['module']),
    relatedSystem: getValueFromRow(row, ['related system', 'related_system', 'relatedsystem', 'related system required', 'Related System (Required)']),
    outcomeRef: getValueFromRow(row, ['outcome cef reference', 'outcome/cef reference #', 'outcome_ref','Outcome/CEF Applicable (Yes/No) ']),
    outcomeDesc: getValueFromRow(row, ['cms-required outcome and cef description', 'outcome description']),
    applicable: getValueFromRow(row, ['applicable', 'applicable yes/no', 'applicable selection', 'outcome/cef applicable yes/no']),
    justification: getValueFromRow(row, ['justification', 'justification for no']),
  }));
}

export function parseDefinitions(rows) {
  return (rows || []).map((row) => ({
    module: getValueFromRow(row, ['module']),
    relatedSystem: getValueFromRow(row, ['related system', 'related_system', 'relatedsystem', 'related system required', 'Related System (Required)']),
    outcomeRef: getValueFromRow(row, ['outcome cef reference', 'outcome/cef reference #', 'outcome_ref']),
    stateSpecificDesc: getValueFromRow(row, ['state-specific outcome description', 'state specific desc']),
    metricId: getValueFromRow(row, ['metric id', 'metricid']),
    metricName: getValueFromRow(row, ['metric name', 'metricname']),
    metricDescription: getValueFromRow(row, ['metric description', 'metricdescription']),
    numeratorDesc: getValueFromRow(row, ['numerator description', 'numeratordesc']),
    denominatorDesc: getValueFromRow(row, ['denominator description', 'denominatordesc']),
    valueType: getValueFromRow(row, ['value type', 'valuetype']),
    frequency: getValueFromRow(row, ['metric reporting frequency', 'frequency']),
    status: getValueFromRow(row, ['oapd metric status', 'status']),
    note: getValueFromRow(row, ['note']),
  }));
}

export function parseMetricData(rows) {
  return (rows || []).map((row) => ({
    reportingDate: getValueFromRow(row, ['reporting date', 'reportingdate']),
    metricId: getValueFromRow(row, ['metric id', 'metricid']),
    measureCount: getValueFromRow(row, ['measure count', 'measurecount']),
    measureCountDesc: getValueFromRow(row, ['measure count description', 'measurecountdesc']),
    metricValue: getValueFromRow(row, ['metric value', 'metricvalue']),
    numerator: getValueFromRow(row, ['numerator']),
    denominator: getValueFromRow(row, ['denominator']),
    programType: getValueFromRow(row, ['program type', 'programtype']),
    benchmark: getValueFromRow(row, ['internal state benchmark', 'benchmark']),
    comment: getValueFromRow(row, ['comment']),
  }));
}

export function parseSettings(rows) {
  const firstRow = rows?.[0] || {};
  const secondRow = rows?.[1] || {};
  return {
    stateAbbreviation: getValue(firstRow, ['state abbreviation', 'stateabbreviation', 'state_abbreviation']) || getValue(secondRow, ['state abbreviation', 'stateabbreviation', 'state_abbreviation']),
    stateName: getValue(firstRow, ['state name', 'statename']) || getValue(secondRow, ['state name', 'statename']),
  };
}
