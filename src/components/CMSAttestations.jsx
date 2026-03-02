import { useState, useMemo } from 'react';
import { MODULES, getOutcomesForModule } from '../data/referenceData';

export default function CMSAttestations({ data, onChange }) {
  const [selectedModule, setSelectedModule] = useState('');
  const [systemName, setSystemName] = useState('');

  // Group data by module for display
  const moduleGroups = useMemo(() => {
    const groups = {};
    data.forEach((row, idx) => {
      if (!groups[row.module]) groups[row.module] = [];
      groups[row.module].push({ ...row, _idx: idx });
    });
    return groups;
  }, [data]);

  const handleAddModule = () => {
    if (!selectedModule) return;
    // Check if already added
    if (data.some((d) => d.module === selectedModule)) {
      alert(`Module "${selectedModule}" has already been added.`);
      return;
    }
    const outcomes = getOutcomesForModule(selectedModule);
    const newRows = outcomes.map((o) => ({
      module: selectedModule,
      relatedSystem: systemName,
      outcomeRef: o.ref,
      outcomeDesc: o.desc,
      applicable: '',
      justification: '',
    }));
    onChange([...data, ...newRows]);
    setSelectedModule('');
    setSystemName('');
  };

  const handleFieldChange = (idx, field, value) => {
    const updated = [...data];
    updated[idx] = { ...updated[idx], [field]: value };
    // If switching to Yes, clear justification
    if (field === 'applicable' && value === 'Yes') {
      updated[idx].justification = '';
    }
    onChange(updated);
  };

  const handleSystemNameBulkUpdate = (moduleName, newName) => {
    const updated = data.map((row) =>
      row.module === moduleName ? { ...row, relatedSystem: newName } : row
    );
    onChange(updated);
  };

  const handleRemoveModule = (moduleName) => {
    if (window.confirm(`Remove all rows for "${moduleName}"?`)) {
      onChange(data.filter((row) => row.module !== moduleName));
    }
  };

  const handleBulkApplicable = (moduleName, value) => {
    const updated = data.map((row) => {
      if (row.module === moduleName) {
        return {
          ...row,
          applicable: value,
          justification: value === 'Yes' ? '' : row.justification,
        };
      }
      return row;
    });
    onChange(updated);
  };

  const getRowValidation = (row) => {
    const errors = [];
    if (!row.relatedSystem) errors.push('Related System is required');
    if (!row.applicable) errors.push('Outcome/CEF Applicable is required');
    if (row.applicable === 'No' && !row.justification)
      errors.push('Justification is required when "No" is selected');
    return errors;
  };

  const availableModules = MODULES.filter((m) => !data.some((d) => d.module === m));

  return (
    <div className="tab-content">
      <div className="tab-instructions">
        <p>
          <strong>Instructions:</strong> Select a module below. All CMS-required outcomes and CEFs
          will be auto-populated. Enter the system name once per module, then mark each outcome/CEF
          as applicable (Yes/No). Provide justification when selecting "No".
        </p>
      </div>

      {/* Add Module Controls */}
      <div className="add-module-section">
        <div className="add-module-row">
          <div className="field-group">
            <label>Module</label>
            <select value={selectedModule} onChange={(e) => setSelectedModule(e.target.value)}>
              <option value="">-- Select Module --</option>
              {availableModules.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div className="field-group">
            <label>Related System Name <span className="required">*</span></label>
            <input
              type="text"
              placeholder="Enter system name..."
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAddModule}
            disabled={!selectedModule}
          >
            + Add Module
          </button>
        </div>
      </div>

      {/* Module Sections */}
      {Object.entries(moduleGroups).map(([moduleName, rows]) => {
        const completedRows = rows.filter((r) => getRowValidation(r).length === 0).length;
        return (
          <div key={moduleName} className="module-section">
            <div className="module-header">
              <div className="module-title">
                <h3>{moduleName}</h3>
                <span className={`completion-badge ${completedRows === rows.length ? 'badge-complete' : 'badge-incomplete'}`}>
                  {completedRows}/{rows.length} complete
                </span>
              </div>
              <div className="module-actions">
                <label>System Name: </label>
                <input
                  type="text"
                  value={rows[0]?.relatedSystem || ''}
                  onChange={(e) => handleSystemNameBulkUpdate(moduleName, e.target.value)}
                  placeholder="Enter system name..."
                  className={!rows[0]?.relatedSystem ? 'input-error' : ''}
                />
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleBulkApplicable(moduleName, 'Yes')}
                  title="Set all to Yes"
                >
                  All Yes
                </button>
                <button
                  className="btn btn-sm btn-warning"
                  onClick={() => handleBulkApplicable(moduleName, 'No')}
                  title="Set all to No"
                >
                  All No
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleRemoveModule(moduleName)}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '100px' }}>Ref #</th>
                    <th>CMS-Required Outcome/CEF Description</th>
                    <th style={{ width: '130px' }}>Applicable</th>
                    <th style={{ width: '250px' }}>Justification for "No"</th>
                    <th style={{ width: '40px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const errors = getRowValidation(row);
                    return (
                      <tr key={row._idx} className={errors.length > 0 ? 'row-incomplete' : 'row-complete'}>
                        <td className="ref-cell">{row.outcomeRef}</td>
                        <td className="desc-cell" title={row.outcomeDesc}>
                          {row.outcomeDesc.length > 150
                            ? row.outcomeDesc.substring(0, 150) + '...'
                            : row.outcomeDesc}
                        </td>
                        <td>
                          <select
                            value={row.applicable}
                            onChange={(e) => handleFieldChange(row._idx, 'applicable', e.target.value)}
                            className={!row.applicable ? 'input-error' : ''}
                          >
                            <option value="">--</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                          </select>
                        </td>
                        <td>
                          <textarea
                            value={row.justification}
                            onChange={(e) =>
                              handleFieldChange(row._idx, 'justification', e.target.value)
                            }
                            disabled={row.applicable !== 'No'}
                            placeholder={row.applicable === 'No' ? 'Required...' : ''}
                            className={
                              row.applicable === 'No' && !row.justification ? 'input-error' : ''
                            }
                            rows={1}
                          />
                        </td>
                        <td>
                          {errors.length > 0 && (
                            <span className="error-icon" title={errors.join('\n')}>⚠️</span>
                          )}
                          {errors.length === 0 && <span className="success-icon">✓</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      {data.length === 0 && (
        <div className="empty-state">
          <p>No modules added yet. Select a module above to get started.</p>
        </div>
      )}
    </div>
  );
}
