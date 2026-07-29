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

const NULL_TEXT = /^(nan|null|none|<na>|n\/a)$/i;

function cleanText(value) {
  if (value === null || value === undefined) return '';
  const cleaned = String(value).replace(/\u200b/g, '').trim();
  return NULL_TEXT.test(cleaned) ? '' : cleaned;
}

function normalizeMetricId(value) {
  return cleanText(value)
    .replace(/DSS\/DW/gi, 'DSSDW')
    .replace(/[‐‑–—]/g, '-')
    .replace(/[_\s]/g, '');
}

function normalizeOutcomeReference(value) {
  return cleanText(value)
    .replace(/DSS\/DW/gi, 'DSSDW')
    .replace(/[-\s]/g, '');
}

function normalizeValueType(value) {
  const cleaned = cleanText(value);
  if (/num/i.test(cleaned)) return 'Numerical';
  if (/percent/i.test(cleaned)) return 'Percentage';
  if (/list/i.test(cleaned)) return 'List';
  return cleaned;
}

function cleanNumericText(value) {
  const cleaned = cleanText(value);
  if (!cleaned) return '';
  const withoutCommas = cleaned.replace(/,/g, '');
  return Number.isFinite(Number(withoutCommas)) ? withoutCommas : cleaned;
}

function formatDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  return cleanText(value);
}

export function parseAttestations(rows) {
  return (rows || []).map((row) => ({
    sourceRow: row.__rowNumber,
    module: cleanText(getValueFromRow(row, ['module'])),
    relatedSystem: cleanText(getValueFromRow(row, ['related system', 'related_system', 'relatedsystem', 'related system required', 'Related System (Required)'])),
    outcomeRef: normalizeOutcomeReference(getValueFromRow(row, ['outcome cef reference', 'outcome/cef reference #', 'outcome_ref','Outcome/CEF Applicable (Yes/No) '])),
    outcomeDesc: cleanText(getValueFromRow(row, ['cms-required outcome and cef description', 'outcome description'])),
    applicable: cleanText(getValueFromRow(row, ['applicable', 'applicable yes/no', 'applicable selection', 'outcome/cef applicable yes/no'])),
    justification: cleanText(getValueFromRow(row, ['justification', 'justification for no'])),
  }));
}

export function parseDefinitions(rows) {
  return (rows || []).map((row) => ({
    sourceRow: row.__rowNumber,
    module: cleanText(getValueFromRow(row, ['module'])),
    relatedSystem: cleanText(getValueFromRow(row, ['related system', 'related_system', 'relatedsystem', 'related system required', 'related system recommended', 'Related System (Required)'])),
    outcomeRef: normalizeOutcomeReference(getValueFromRow(row, ['outcome cef reference', 'outcome/cef reference #', 'outcome_ref'])),
    stateSpecificDesc: cleanText(getValueFromRow(row, ['state-specific outcome description', 'state specific desc'])),
    metricId: normalizeMetricId(getValueFromRow(row, ['metric id', 'metricid'])),
    metricName: cleanText(getValueFromRow(row, ['metric name', 'metricname'])),
    metricDescription: cleanText(getValueFromRow(row, ['metric description', 'metricdescription'])),
    numeratorDesc: cleanText(getValueFromRow(row, ['numerator description', 'numeratordesc'])),
    denominatorDesc: cleanText(getValueFromRow(row, ['denominator description', 'denominatordesc'])),
    valueType: normalizeValueType(getValueFromRow(row, ['value type', 'valuetype'])),
    frequency: cleanText(getValueFromRow(row, ['metric reporting frequency', 'frequency'])) || 'Monthly',
    status: cleanText(getValueFromRow(row, ['oapd metric status', 'status'])) || 'Active',
    note: cleanText(getValueFromRow(row, ['note'])),
  }));
}

export function parseMetricData(rows, metricDefinitions = []) {
  const parsedRows = (rows || []).map((row) => ({
    sourceRow: row.__rowNumber,
    reportingDate: formatDate(getValueFromRow(row, ['reporting date', 'reportingdate'])),
    metricId: normalizeMetricId(getValueFromRow(row, ['metric id', 'metricid'])),
    measureCount: cleanNumericText(getValueFromRow(row, ['measure count', 'measurecount'])),
    measureCountDesc: cleanText(getValueFromRow(row, ['measure count description', 'measurecountdesc'])),
    metricValue: cleanNumericText(getValueFromRow(row, ['metric value', 'metricvalue'])),
    numerator: cleanNumericText(getValueFromRow(row, ['numerator'])),
    denominator: cleanNumericText(getValueFromRow(row, ['denominator'])),
    programType: cleanText(getValueFromRow(row, ['program type', 'program type required', 'programtype', 'programtyperequired'])) || 'Medicaid',
    benchmark: cleanText(getValueFromRow(row, ['internal state benchmark', 'benchmark'])),
    comment: cleanText(getValueFromRow(row, ['comment'])),
  })).filter((row) => row.reportingDate || row.metricId || row.measureCount);

  const definitionsById = new Map(metricDefinitions.map((definition) => [definition.metricId, definition]));
  const pairCounts = new Map();
  parsedRows.forEach((row) => {
    const key = `${row.reportingDate}|${row.metricId}`;
    pairCounts.set(key, (pairCounts.get(key) || 0) + 1);
  });

  return parsedRows.map((row) => {
    const key = `${row.reportingDate}|${row.metricId}`;
    const cleaned = { ...row };
    if (!cleaned.measureCount && pairCounts.get(key) === 1) cleaned.measureCount = '1';

    const valueType = definitionsById.get(cleaned.metricId)?.valueType;
    if (valueType === 'Percentage') {
      const ratio = cleaned.metricValue.match(/^\s*(\d+)\s*:\s*(\d+)\s*$/);
      if (ratio) {
        cleaned.numerator = ratio[1];
        cleaned.denominator = ratio[2];
      }
      if (cleaned.numerator && cleaned.denominator && Number(cleaned.denominator) !== 0 && !cleaned.metricId.includes('EVV-5')) {
        cleaned.metricValue = String(Number(cleaned.numerator) / Number(cleaned.denominator));
      }
    }
    return cleaned;
  });
}

export function parseSettings(rows) {
  const firstRow = rows?.[0] || {};
  const secondRow = rows?.[1] || {};
  return {
    stateAbbreviation: getValue(firstRow, ['state abbreviation', 'stateabbreviation', 'state_abbreviation']) || getValue(secondRow, ['state abbreviation', 'stateabbreviation', 'state_abbreviation']),
    stateName: getValue(firstRow, ['state name', 'statename']) || getValue(secondRow, ['state name', 'statename']),
  };
}
