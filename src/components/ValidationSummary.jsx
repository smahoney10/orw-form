export default function ValidationSummary({ isOpen, onClose, errors }) {
  if (!isOpen) return null;

  const totalErrors = Object.values(errors).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="validation-overlay" onClick={onClose}>
      <div className="validation-panel" onClick={(e) => e.stopPropagation()}>
        <div className="validation-header">
          <h2>
            {totalErrors === 0 ? '✅ All Validations Passed' : `⚠️ ${totalErrors} Validation Issue(s)`}
          </h2>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="validation-body">
          {/* CMS Attestations */}
          <div className="validation-section">
            <h3>
              📋 CMS Attestations
              {errors.attestations?.length > 0 ? (
                <span className="error-count">{errors.attestations.length}</span>
              ) : (
                <span className="success-count">✓</span>
              )}
            </h3>
            {errors.attestations?.length > 0 ? (
              <ul>
                {errors.attestations.map((err, i) => (
                  <li key={i} className="error-item">{err}</li>
                ))}
              </ul>
            ) : (
              <p className="no-errors">No issues found.</p>
            )}
          </div>

          {/* Metric Definitions */}
          <div className="validation-section">
            <h3>
              📐 Metric Definitions
              {errors.definitions?.length > 0 ? (
                <span className="error-count">{errors.definitions.length}</span>
              ) : (
                <span className="success-count">✓</span>
              )}
            </h3>
            {errors.definitions?.length > 0 ? (
              <ul>
                {errors.definitions.map((err, i) => (
                  <li key={i} className="error-item">{err}</li>
                ))}
              </ul>
            ) : (
              <p className="no-errors">No issues found.</p>
            )}
          </div>

          {/* Metric Data */}
          <div className="validation-section">
            <h3>
              📊 Metric Data
              {errors.data?.length > 0 ? (
                <span className="error-count">{errors.data.length}</span>
              ) : (
                <span className="success-count">✓</span>
              )}
            </h3>
            {errors.data?.length > 0 ? (
              <ul>
                {errors.data.map((err, i) => (
                  <li key={i} className="error-item">{err}</li>
                ))}
              </ul>
            ) : (
              <p className="no-errors">No issues found.</p>
            )}
          </div>

          {/* Settings */}
          <div className="validation-section">
            <h3>
              ⚙️ Settings
              {errors.settings?.length > 0 ? (
                <span className="error-count">{errors.settings.length}</span>
              ) : (
                <span className="success-count">✓</span>
              )}
            </h3>
            {errors.settings?.length > 0 ? (
              <ul>
                {errors.settings.map((err, i) => (
                  <li key={i} className="error-item">{err}</li>
                ))}
              </ul>
            ) : (
              <p className="no-errors">No issues found.</p>
            )}
          </div>
        </div>

        <div className="validation-footer">
          {totalErrors > 0 ? (
            <p className="warning-text">
              ⚠️ Please resolve all issues before exporting. You may still export with warnings by
              clicking "Export Anyway" in the export dialog.
            </p>
          ) : (
            <p className="success-text">🎉 Everything looks good! You're ready to export.</p>
          )}
        </div>
      </div>
    </div>
  );
}
