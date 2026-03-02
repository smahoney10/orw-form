import { useState, useMemo } from 'react';
import { PROGRAM_TYPES } from '../data/referenceData';

const EMPTY_ROW = {
  reportingDate: '',
  metricId: '',
  measureCount: '',
  measureCountDesc: '',
  metricValue: '',
  numerator: '',
  denominator: '',
  programType: '',
  benchmark: '',
  comment: '',
};

export default function MetricData({ data, onChange, metricDefinitions }) {
  const [bulkDate, setBulkDate] = useState('');

  // Build metric ID options from definitions
  const metricIdOptions = useMemo(() => {
    return metricDefinitions
      .filter((d) => d.metricId)
      .map((d) => ({
        id: d.metricId,
        name: d.metricName,
        valueType: d.valueType,
        module: d.module,
      }));
  }, [metricDefinitions]);

  // Get value type for a given metric ID
  const getValueType = (metricId) => {
    const def = metricDefinitions.find((d) => d.metricId === metricId);
    return def?.valueType || '';
  };

  const handleAddRow = () => {
    onChange([...data, { ...EMPTY_ROW, reportingDate: bulkDate }]);
  };

  const handleRemoveRow = (idx) => {
    onChange(data.filter((_, i) => i !== idx));
  };

  const handleFieldChange = (idx, field, value) => {
    const updated = [...data];
    updated[idx] = { ...updated[idx], [field]: value };

    // Auto-clear numerator/denominator if metric is not percentage
    if (field === 'metricId') {
      const vt = getValueType(value);
      if (vt !== 'Percentage') {
        updated[idx].numerator = '';
        updated[idx].denominator = '';
      }
    }

    // Auto-calculate percentage
    if (field === 'numerator' || field === 'denominator') {
      const num = parseFloat(updated[idx].numerator);
      const den = parseFloat(updated[idx].denominator);
      if (!isNaN(num) && !isNaN(den) && den !== 0) {
        const vt = getValueType(updated[idx].metricId);
        if (vt === 'Percentage') {
          updated[idx].metricValue = ((num / den) * 100).toFixed(2);
        }
      }
    }

    onChange(updated);
  };

  const handleBulkDateApply = () => {
    if (!bulkDate) return;
    const updated = data.map((row) => ({ ...row, reportingDate: bulkDate }));
    onChange(updated);
  };

  const handleClonePreviousMonth = () => {
    if (data.length === 0) {
      alert('No data rows to clone.');
      return;
    }
    // Find the latest reporting date
    const dates = data.map((r) => r.reportingDate).filter(Boolean);
    if (dates.length === 0) {
      alert('No reporting dates found to clone from.');
      return;
    }

    const latestDate = dates.sort().pop();
    const latestRows = data.filter((r) => r.reportingDate === latestDate);

    // Calculate next month
    const d = new Date(latestDate);
    d.setMonth(d.getMonth() + 1);
    const nextMonth = d.toISOString().split('T')[0];

    const clonedRows = latestRows.map((row) => ({
      ...row,
      reportingDate: nextMonth,
      metricValue: '',
      numerator: '',
      denominator: '',
      comment: '',
    }));

    onChange([...data, ...clonedRows]);
    setBulkDate(nextMonth);
  };

  const getRowValidation = (row) => {
    const errors = [];
    if (!row.reportingDate) errors.push('Reporting Date is required');
    if (!row.metricId) errors.push('Metric ID is required');
    if (!row.programType) errors.push('Program Type is required');

    // Date validation
    if (row.reportingDate) {
      const d = new Date(row.reportingDate);
      if (isNaN(d.getTime())) {
        errors.push('Invalid date format');
      } else if (d > new Date()) {
        errors.push('Date is in the future');
      }
    }

    // If metric value is blank, comment is required
    if (!row.metricValue && !row.comment) {
      errors.push('Comment required when Metric Value is missing');
    }

    // If percentage type, numerator and denominator required
    const vt = getValueType(row.metricId);
    if (vt === 'Percentage' && row.metricValue) {
      if (!row.numerator) errors.push('Numerator required for Percentage metrics');
      if (!row.denominator) errors.push('Denominator required for Percentage metrics');
    }

    // Measure count validation
    if (row.measureCount && (isNaN(row.measureCount) || parseInt(row.measureCount) < 1)) {
      errors.push('Measure Count must be a positive integer');
    }

    return errors;
  };

  return (
    <div className="tab-content">
      <div className="tab-instructions">
        <p>
          <strong>Instructions:</strong> Report metric data monthly or as agreed with CMS. Metric
          IDs are auto-populated from the Definitions tab. For Percentage metrics,
          numerator/denominator fields are shown and the value is auto-calculated. Use "Clone
          Previous Month" to duplicate entries with a new date.
        </p>
      </div>

      <div className="action-bar">
        <button className="btn btn-primary" onClick={handleAddRow}>
          + Add Data Row
        </button>
        <div className="bulk-date-section">
          <label>Bulk Date:</label>
          <input
            type="date"
            value={bulkDate}
            onChange={(e) => setBulkDate(e.target.value)}
          />
          <button
            className="btn btn-secondary"
            onClick={handleBulkDateApply}
            disabled={!bulkDate || data.length === 0}
          >
            Apply to All
          </button>
        </div>
        <button
          className="btn btn-secondary"
          onClick={handleClonePreviousMonth}
          disabled={data.length === 0}
        >
          📋 Clone Previous Month
        </button>
        <span className="row-count">{data.length} data row(s)</span>
      </div>

      {data.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table metric-data-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Reporting Date</th>
                <th style={{ width: '180px' }}>Metric ID</th>
                <th style={{ width: '70px' }}>Measure Count</th>
                <th style={{ width: '150px' }}>Measure Count Desc</th>
                <th style={{ width: '100px' }}>Metric Value</th>
                <th style={{ width: '90px' }}>Numerator</th>
                <th style={{ width: '90px' }}>Denominator</th>
                <th style={{ width: '110px' }}>Program Type</th>
                <th style={{ width: '100px' }}>Benchmark</th>
                <th style={{ width: '180px' }}>Comment</th>
                <th style={{ width: '60px' }}></th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                const errors = getRowValidation(row);
                const vt = getValueType(row.metricId);
                const isPercentage = vt === 'Percentage';

                return (
                  <tr key={idx} className={errors.length > 0 ? 'row-incomplete' : 'row-complete'}>
                    <td>
                      <input
                        type="date"
                        value={row.reportingDate}
                        onChange={(e) => handleFieldChange(idx, 'reportingDate', e.target.value)}
                        className={!row.reportingDate ? 'input-error' : ''}
                      />
                    </td>
                    <td>
                      <select
                        value={row.metricId}
                        onChange={(e) => handleFieldChange(idx, 'metricId', e.target.value)}
                        className={!row.metricId ? 'input-error' : ''}
                      >
                        <option value="">-- Select --</option>
                        {metricIdOptions.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.id} {opt.name ? `(${opt.name})` : ''}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        min="1"
                        value={row.measureCount}
                        onChange={(e) => handleFieldChange(idx, 'measureCount', e.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.measureCountDesc}
                        onChange={(e) => handleFieldChange(idx, 'measureCountDesc', e.target.value)}
                        placeholder="Optional"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.metricValue}
                        onChange={(e) => handleFieldChange(idx, 'metricValue', e.target.value)}
                        className={!row.metricValue && !row.comment ? 'input-warning' : ''}
                        placeholder={isPercentage ? 'Auto-calc' : ''}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.numerator}
                        onChange={(e) => handleFieldChange(idx, 'numerator', e.target.value)}
                        disabled={!isPercentage}
                        className={
                          isPercentage && row.metricValue && !row.numerator ? 'input-error' : ''
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        value={row.denominator}
                        onChange={(e) => handleFieldChange(idx, 'denominator', e.target.value)}
                        disabled={!isPercentage}
                        className={
                          isPercentage && row.metricValue && !row.denominator ? 'input-error' : ''
                        }
                      />
                    </td>
                    <td>
                      <select
                        value={row.programType}
                        onChange={(e) => handleFieldChange(idx, 'programType', e.target.value)}
                        className={!row.programType ? 'input-error' : ''}
                      >
                        <option value="">--</option>
                        {PROGRAM_TYPES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.benchmark}
                        onChange={(e) => handleFieldChange(idx, 'benchmark', e.target.value)}
                        placeholder="Optional"
                      />
                    </td>
                    <td>
                      <textarea
                        value={row.comment}
                        onChange={(e) => handleFieldChange(idx, 'comment', e.target.value)}
                        rows={1}
                        className={!row.metricValue && !row.comment ? 'input-error' : ''}
                        placeholder={!row.metricValue ? 'Required...' : 'Optional'}
                      />
                    </td>
                    <td className="action-cell">
                      {errors.length > 0 && (
                        <span className="error-icon" title={errors.join('\n')}>⚠️</span>
                      )}
                      <button
                        className="btn btn-xs btn-danger"
                        onClick={() => handleRemoveRow(idx)}
                        title="Remove row"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {data.length === 0 && (
        <div className="empty-state">
          <p>
            No metric data yet. {metricIdOptions.length === 0 
              ? 'Define metrics in the "Metric Definitions" tab first.' 
              : 'Click "Add Data Row" to start entering data.'}
          </p>
        </div>
      )}
    </div>
  );
}
