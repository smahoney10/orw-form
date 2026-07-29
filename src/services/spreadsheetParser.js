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
    if (normalizedRow[key] !== undefined && normalizedRow[key] !== '') {
      return normalizedRow[key];
    }
  }

  return '';
}

function getHeaderSource(sheetRows) {
  if (!Array.isArray(sheetRows) || sheetRows.length === 0) {
    return [];
  }

  const headerRows = [];
  if (sheetRows[0]) headerRows.push(sheetRows[0]);
  if (sheetRows[1]) headerRows.push(sheetRows[1]);
  return headerRows;
}

function getValueFromHeaderRows(rows, candidates) {
  const headerRows = getHeaderSource(rows);
  if (headerRows.length === 0) return '';

  for (const headerRow of headerRows) {
    const value = getValue(headerRow, candidates);
    if (value !== '') return value;
  }

  return '';
}

export function parseAttestations(rows) {
  return (rows || []).map((row) => ({
    module: getValueFromHeaderRows(rows, ['module']),
    relatedSystem: getValueFromHeaderRows(rows, ['related system', 'related_system', 'relatedsystem', 'related system required', 'Related System (Required)']),
    outcomeRef: getValueFromHeaderRows(rows, ['outcome cef reference', 'outcome/cef reference #', 'outcome_ref','Outcome/CEF Applicable (Yes/No) ']),
    outcomeDesc: getValueFromHeaderRows(rows, ['cms-required outcome and cef description', 'outcome description']),
    applicable: getValueFromHeaderRows(rows, ['applicable', 'applicable yes/no', 'applicable selection', 'outcome/cef applicable yes/no']),
    justification: getValueFromHeaderRows(rows, ['justification', 'justification for no']),
  }));
}

export function parseDefinitions(rows) {
  return (rows || []).map((row) => ({
    module: getValueFromHeaderRows(rows, ['module']),
    relatedSystem: getValueFromHeaderRows(rows, ['related system', 'related_system', 'relatedsystem', 'related system required', 'Related System (Required)']),
    outcomeRef: getValueFromHeaderRows(rows, ['outcome cef reference', 'outcome/cef reference #', 'outcome_ref']),
    stateSpecificDesc: getValueFromHeaderRows(rows, ['state-specific outcome description', 'state specific desc']),
    metricId: getValueFromHeaderRows(rows, ['metric id', 'metricid']),
    metricName: getValueFromHeaderRows(rows, ['metric name', 'metricname']),
    metricDescription: getValueFromHeaderRows(rows, ['metric description', 'metricdescription']),
    numeratorDesc: getValueFromHeaderRows(rows, ['numerator description', 'numeratordesc']),
    denominatorDesc: getValueFromHeaderRows(rows, ['denominator description', 'denominatordesc']),
    valueType: getValueFromHeaderRows(rows, ['value type', 'valuetype']),
    frequency: getValueFromHeaderRows(rows, ['metric reporting frequency', 'frequency']),
    status: getValueFromHeaderRows(rows, ['oapd metric status', 'status']),
    note: getValueFromHeaderRows(rows, ['note']),
  }));
}

export function parseMetricData(rows) {
  return (rows || []).map((row) => ({
    reportingDate: getValueFromHeaderRows(rows, ['reporting date', 'reportingdate']),
    metricId: getValueFromHeaderRows(rows, ['metric id', 'metricid']),
    measureCount: getValueFromHeaderRows(rows, ['measure count', 'measurecount']),
    measureCountDesc: getValueFromHeaderRows(rows, ['measure count description', 'measurecountdesc']),
    metricValue: getValueFromHeaderRows(rows, ['metric value', 'metricvalue']),
    numerator: getValueFromHeaderRows(rows, ['numerator']),
    denominator: getValueFromHeaderRows(rows, ['denominator']),
    programType: getValueFromHeaderRows(rows, ['program type', 'programtype']),
    benchmark: getValueFromHeaderRows(rows, ['internal state benchmark', 'benchmark']),
    comment: getValueFromHeaderRows(rows, ['comment']),
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
