import { useState, useMemo } from 'react';
import {
  MODULES,
  MODULE_ABBREVIATIONS,
  getOutcomeRefsForModule,
  VALUE_TYPES,
  METRIC_FREQUENCIES,
  METRIC_STATUSES,
} from '../data/referenceData';

const EMPTY_ROW = {
  module: '',
  relatedSystem: '',
  outcomeRef: '',
  stateSpecificDesc: '',
  metricId: '',
  metricName: '',
  metricDescription: '',
  numeratorDesc: '',
  denominatorDesc: '',
  valueType: '',
  frequency: '',
  status: 'Active',
  note: '',
};

export default function MetricDefinitions({ data, onChange, settings }) {
  const [expandedRow, setExpandedRow] = useState(null);

  const handleAddRow = () => {
    onChange([...data, { ...EMPTY_ROW }]);
    setExpandedRow(data.length);
  };

  const handleRemoveRow = (idx) => {
    if (window.confirm('Remove this metric definition?')) {
      const updated = data.filter((_, i) => i !== idx);
      onChange(updated);
      if (expandedRow === idx) setExpandedRow(null);
    }
  };

  const handleFieldChange = (idx, field, value) => {
    const updated = [...data];
    updated[idx] = { ...updated[idx], [field]: value };

    // Auto-clear numerator/denominator if not percentage
    if (field === 'valueType' && value !== 'Percentage') {
      updated[idx].numeratorDesc = '';
      updated[idx].denominatorDesc = '';
    }

    onChange(updated);
  };

  const generateMetricId = (idx) => {
    const row = data[idx];
    if (!settings.stateAbbreviation || !row.module || !row.outcomeRef) return;

    const moduleAbbrev = MODULE_ABBREVIATIONS[row.module] || 'XX';
    const isStateSpecific = row.outcomeRef.startsWith('ST');
    const prefix = isStateSpecific ? 'ST' : 'CR';

    // Count existing metric IDs for this module+outcome to get consecutive number
    const existingIds = data
      .filter((d, i) => i !== idx && d.module === row.module)
      .map((d) => d.metricId);

    let consecutive = 1;
    while (
      existingIds.includes(
        `${settings.stateAbbreviation}-${prefix}-${moduleAbbrev}-${row.outcomeRef}.${consecutive}`
      )
    ) {
      consecutive++;
    }

    const newId = `${settings.stateAbbreviation}-${prefix}-${moduleAbbrev}-${row.outcomeRef}.${consecutive}`;
    handleFieldChange(idx, 'metricId', newId);
  };

  const getRowValidation = (row) => {
    const errors = [];
    if (!row.module) errors.push('Module is required');
    if (!row.relatedSystem) errors.push('Related System is required');
    if (!row.outcomeRef) errors.push('Outcome/CEF Reference # is required');
    if (!row.metricId) errors.push('Metric ID is required');
    if (!row.metricName) errors.push('Metric Name is required');
    if (!row.metricDescription) errors.push('Metric Description is required');
    if (!row.valueType) errors.push('Value Type is required');
    if (!row.frequency) errors.push('Metric Reporting Frequency is required');
    if (!row.status) errors.push('OAPD Metric Status is required');
    if (row.valueType === 'Percentage') {
      if (!row.numeratorDesc) errors.push('Numerator Description required for Percentage type');
      if (!row.denominatorDesc) errors.push('Denominator Description required for Percentage type');
    }
    // Check for duplicate metric IDs
    const duplicates = data.filter((d) => d.metricId && d.metricId === row.metricId);
    if (duplicates.length > 1) errors.push('Duplicate Metric ID detected');
    return errors;
  };

  const availableOutcomeRefs = (moduleName) => {
    if (!moduleName) return [];
    return getOutcomeRefsForModule(moduleName);
  };

  return (
    <div className="tab-content">
      <div className="tab-instructions">
        <p>
          <strong>Instructions:</strong> Define each metric to report. Select a module, choose the
          outcome/CEF reference, and the Metric ID will be auto-generated. For state-specific
          outcomes, use the "ST" prefix in the reference number and provide a description.
        </p>
      </div>

      <div className="action-bar">
        <button className="btn btn-primary" onClick={handleAddRow}>
          + Add Metric Definition
        </button>
        <span className="row-count">{data.length} metric(s) defined</span>
      </div>

      {data.map((row, idx) => {
        const errors = getRowValidation(row);
        const isExpanded = expandedRow === idx;

        return (
          <div
            key={idx}
            className={`metric-card ${errors.length > 0 ? 'card-incomplete' : 'card-complete'}`}
          >
            <div
              className="metric-card-header"
              onClick={() => setExpandedRow(isExpanded ? null : idx)}
            >
              <div className="metric-card-title">
                <span className="metric-number">#{idx + 1}</span>
                <strong>{row.metricId || 'New Metric'}</strong>
                {row.metricName && <span className="metric-name-preview"> — {row.metricName}</span>}
              </div>
              <div className="metric-card-actions">
                {errors.length > 0 && (
                  <span className="error-badge" title={errors.join('\n')}>
                    {errors.length} issue{errors.length > 1 ? 's' : ''}
                  </span>
                )}
                {errors.length === 0 && <span className="success-badge">✓ Valid</span>}
                <button
                  className="btn btn-sm btn-danger"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveRow(idx);
                  }}
                >
                  ✕
                </button>
                <span className="expand-icon">{isExpanded ? '▾' : '▸'}</span>
              </div>
            </div>

            {isExpanded && (
              <div className="metric-card-body">
                <div className="form-grid">
                  {/* Row 1 */}
                  <div className="field-group">
                    <label>Module <span className="required">*</span></label>
                    <select
                      value={row.module}
                      onChange={(e) => handleFieldChange(idx, 'module', e.target.value)}
                      className={!row.module ? 'input-error' : ''}
                    >
                      <option value="">-- Select --</option>
                      {MODULES.map((m) => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field-group">
                    <label>Related System <span className="required">*</span></label>
                    <input
                      type="text"
                      value={row.relatedSystem}
                      onChange={(e) => handleFieldChange(idx, 'relatedSystem', e.target.value)}
                      className={!row.relatedSystem ? 'input-error' : ''}
                      placeholder="System name..."
                    />
                  </div>

                  <div className="field-group">
                    <label>Outcome/CEF Ref # <span className="required">*</span></label>
                    <div className="input-with-button">
                      <select
                        value={row.outcomeRef}
                        onChange={(e) => handleFieldChange(idx, 'outcomeRef', e.target.value)}
                        className={!row.outcomeRef ? 'input-error' : ''}
                      >
                        <option value="">-- Select --</option>
                        {availableOutcomeRefs(row.module).map((ref) => (
                          <option key={ref} value={ref}>{ref}</option>
                        ))}
                        <option value="custom">Custom (State-Specific)...</option>
                      </select>
                    </div>
                    {row.outcomeRef === 'custom' && (
                      <input
                        type="text"
                        placeholder="e.g., STCP01"
                        className="mt-1"
                        onChange={(e) => handleFieldChange(idx, 'outcomeRef', e.target.value)}
                      />
                    )}
                  </div>

                  {/* Row 2 */}
                  <div className="field-group span-3">
                    <label>State-Specific Outcome Description</label>
                    <textarea
                      value={row.stateSpecificDesc}
                      onChange={(e) => handleFieldChange(idx, 'stateSpecificDesc', e.target.value)}
                      placeholder="Leave blank for CMS-required outcomes and CEFs"
                      rows={2}
                    />
                  </div>

                  {/* Row 3 */}
                  <div className="field-group">
                    <label>Metric ID <span className="required">*</span></label>
                    <div className="input-with-button">
                      <input
                        type="text"
                        value={row.metricId}
                        onChange={(e) => handleFieldChange(idx, 'metricId', e.target.value)}
                        className={!row.metricId ? 'input-error' : ''}
                        placeholder="Auto-generated..."
                      />
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => generateMetricId(idx)}
                        disabled={!settings.stateAbbreviation || !row.module || !row.outcomeRef}
                        title="Auto-generate Metric ID"
                      >
                        🔄
                      </button>
                    </div>
                  </div>

                  <div className="field-group">
                    <label>Metric Name <span className="required">*</span></label>
                    <input
                      type="text"
                      value={row.metricName}
                      onChange={(e) => handleFieldChange(idx, 'metricName', e.target.value)}
                      className={!row.metricName ? 'input-error' : ''}
                    />
                  </div>

                  <div className="field-group">
                    <label>Value Type <span className="required">*</span></label>
                    <select
                      value={row.valueType}
                      onChange={(e) => handleFieldChange(idx, 'valueType', e.target.value)}
                      className={!row.valueType ? 'input-error' : ''}
                    >
                      <option value="">-- Select --</option>
                      {VALUE_TYPES.map((v) => (
                        <option key={v} value={v}>{v}</option>
                      ))}
                    </select>
                  </div>

                  {/* Row 4 */}
                  <div className="field-group span-3">
                    <label>Metric Description <span className="required">*</span></label>
                    <textarea
                      value={row.metricDescription}
                      onChange={(e) => handleFieldChange(idx, 'metricDescription', e.target.value)}
                      className={!row.metricDescription ? 'input-error' : ''}
                      rows={2}
                    />
                  </div>

                  {/* Row 5 - Conditional */}
                  {row.valueType === 'Percentage' && (
                    <>
                      <div className="field-group">
                        <label>Numerator Description <span className="required">*</span></label>
                        <input
                          type="text"
                          value={row.numeratorDesc}
                          onChange={(e) => handleFieldChange(idx, 'numeratorDesc', e.target.value)}
                          className={!row.numeratorDesc ? 'input-error' : ''}
                        />
                      </div>
                      <div className="field-group">
                        <label>Denominator Description <span className="required">*</span></label>
                        <input
                          type="text"
                          value={row.denominatorDesc}
                          onChange={(e) =>
                            handleFieldChange(idx, 'denominatorDesc', e.target.value)
                          }
                          className={!row.denominatorDesc ? 'input-error' : ''}
                        />
                      </div>
                      <div className="field-group" />
                    </>
                  )}

                  {/* Row 6 */}
                  <div className="field-group">
                    <label>Reporting Frequency <span className="required">*</span></label>
                    <select
                      value={row.frequency}
                      onChange={(e) => handleFieldChange(idx, 'frequency', e.target.value)}
                      className={!row.frequency ? 'input-error' : ''}
                    >
                      <option value="">-- Select --</option>
                      {METRIC_FREQUENCIES.map((f) => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field-group">
                    <label>OAPD Metric Status <span className="required">*</span></label>
                    <select
                      value={row.status}
                      onChange={(e) => handleFieldChange(idx, 'status', e.target.value)}
                      className={!row.status ? 'input-error' : ''}
                    >
                      <option value="">-- Select --</option>
                      {METRIC_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div className="field-group">
                    <label>Note</label>
                    <textarea
                      value={row.note}
                      onChange={(e) => handleFieldChange(idx, 'note', e.target.value)}
                      rows={1}
                      placeholder="Optional notes..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {data.length === 0 && (
        <div className="empty-state">
          <p>No metric definitions yet. Click "Add Metric Definition" to get started.</p>
        </div>
      )}
    </div>
  );
}
