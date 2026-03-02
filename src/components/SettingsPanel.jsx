import { useState } from 'react';

export default function SettingsPanel({ settings, onSettingsChange }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="settings-panel">
      <div className="settings-header" onClick={() => setIsOpen(!isOpen)}>
        <h3>⚙️ State Settings {isOpen ? '▾' : '▸'}</h3>
        {!isOpen && settings.stateAbbreviation && (
          <span className="settings-summary">
            {settings.stateAbbreviation} — {settings.stateName || 'No state name'}
          </span>
        )}
      </div>
      {isOpen && (
        <div className="settings-body">
          <div className="settings-row">
            <div className="settings-field">
              <label htmlFor="stateAbbrev">
                State Abbreviation <span className="required">*</span>
              </label>
              <input
                id="stateAbbrev"
                type="text"
                maxLength={2}
                placeholder="e.g., TN"
                value={settings.stateAbbreviation}
                onChange={(e) =>
                  onSettingsChange({ ...settings, stateAbbreviation: e.target.value.toUpperCase() })
                }
                className={!settings.stateAbbreviation ? 'input-error' : ''}
              />
              {!settings.stateAbbreviation && (
                <span className="field-error">Required for Metric ID generation</span>
              )}
            </div>
            <div className="settings-field">
              <label htmlFor="stateName">State Name</label>
              <input
                id="stateName"
                type="text"
                placeholder="e.g., Tennessee"
                value={settings.stateName}
                onChange={(e) => onSettingsChange({ ...settings, stateName: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
