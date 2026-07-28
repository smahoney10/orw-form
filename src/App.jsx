import { useState, useMemo, useCallback } from 'react';
import * as XLSX from 'xlsx';
import SettingsPanel from './components/SettingsPanel';
import TabNavigation from './components/TabNavigation';
import CMSAttestations from './components/CMSAttestations';
import MetricDefinitions from './components/MetricDefinitions';
import MetricData from './components/MetricData';
import ValidationSummary from './components/ValidationSummary';
import BoxImportChecksPage from './components/BoxImportChecksPage';
import BoxChecksExplanationPage from './components/BoxChecksExplanationPage';
import UploadValidationPage from './components/UploadValidationPage';
import { MODULE_ABBREVIATIONS } from './data/referenceData';
import { runBoxValidation } from './services/boxValidation';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('attestations');
  const [showValidation, setShowValidation] = useState(false);
  const [showBoxChecks, setShowBoxChecks] = useState(false);
  const [showBoxExplanation, setShowBoxExplanation] = useState(false);
  const [showUploadValidation, setShowUploadValidation] = useState(false);

  const [settings, setSettings] = useState({
    stateAbbreviation: '',
    stateName: '',
  });

  const [attestationsData, setAttestationsData] = useState([]);
  const [definitionsData, setDefinitionsData] = useState([]);
  const [metricData, setMetricData] = useState([]);

  // ── Validation Logic ──────────────────────────────────────────────
  const validateAll = useCallback(() => {
    const errors = { settings: [], attestations: [], definitions: [], data: [], boxChecks: [] };

    // Settings
    if (!settings.stateAbbreviation) {
      errors.settings.push('State Abbreviation is required');
    } else if (settings.stateAbbreviation.length !== 2) {
      errors.settings.push('State Abbreviation must be exactly 2 characters');
    }

    // Run Box Validation Checks
    const boxValidation = runBoxValidation(definitionsData, metricData, attestationsData, settings);
    errors.boxChecks = [
      ...boxValidation.prechecks,
      ...boxValidation.checks,
      ...boxValidation.attestationChecks,
    ];

    // Attestations
    attestationsData.forEach((row, i) => {
      if (!row.relatedSystem) {
        errors.attestations.push(`Row ${i + 1} (${row.module} / ${row.outcomeRef}): Related System is required`);
      }
      if (!row.applicable) {
        errors.attestations.push(`Row ${i + 1} (${row.module} / ${row.outcomeRef}): Applicable selection is required`);
      }
      if (row.applicable === 'No' && !row.justification) {
        errors.attestations.push(`Row ${i + 1} (${row.module} / ${row.outcomeRef}): Justification required when "No"`);
      }
    });

    // Definitions
    definitionsData.forEach((row, i) => {
      const label = row.metricId || `#${i + 1}`;
      if (!row.module) errors.definitions.push(`Metric ${label}: Module is required`);
      if (!row.relatedSystem) errors.definitions.push(`Metric ${label}: Related System is required`);
      if (!row.outcomeRef) errors.definitions.push(`Metric ${label}: Outcome/CEF Ref is required`);
      if (!row.metricId) errors.definitions.push(`Metric ${label}: Metric ID is required`);
      if (!row.metricName) errors.definitions.push(`Metric ${label}: Metric Name is required`);
      if (!row.metricDescription) errors.definitions.push(`Metric ${label}: Description is required`);
      if (!row.valueType) errors.definitions.push(`Metric ${label}: Value Type is required`);
      if (!row.frequency) errors.definitions.push(`Metric ${label}: Frequency is required`);
      if (!row.status) errors.definitions.push(`Metric ${label}: Status is required`);
      if (row.valueType === 'Percentage') {
        if (!row.numeratorDesc) errors.definitions.push(`Metric ${label}: Numerator Desc required`);
        if (!row.denominatorDesc) errors.definitions.push(`Metric ${label}: Denominator Desc required`);
      }
      // Duplicate check
      const dupes = definitionsData.filter((d) => d.metricId && d.metricId === row.metricId);
      if (dupes.length > 1) errors.definitions.push(`Metric ${label}: Duplicate Metric ID`);
    });

    // Metric Data
    metricData.forEach((row, i) => {
      const label = `Row ${i + 1}`;
      if (!row.reportingDate) errors.data.push(`${label}: Reporting Date is required`);
      if (!row.metricId) errors.data.push(`${label}: Metric ID is required`);
      if (!row.programType) errors.data.push(`${label}: Program Type is required`);
      if (!row.metricValue && !row.comment) {
        errors.data.push(`${label}: Comment required when Metric Value is missing`);
      }
      if (row.reportingDate) {
        const d = new Date(row.reportingDate);
        if (d > new Date()) errors.data.push(`${label}: Date is in the future`);
      }
    });

    return errors;
  }, [settings, attestationsData, definitionsData, metricData]);

  const validationErrors = useMemo(() => validateAll(), [validateAll]);

  // ── Validation Counts for Tab Badges ──────────────────────────────
  const validationCounts = useMemo(() => {
    const attComplete = attestationsData.filter((r) => {
      return r.relatedSystem && r.applicable && (r.applicable !== 'No' || r.justification);
    }).length;

    const defComplete = definitionsData.filter((r) => {
      return r.module && r.relatedSystem && r.outcomeRef && r.metricId && r.metricName &&
        r.metricDescription && r.valueType && r.frequency && r.status;
    }).length;

    const dataComplete = metricData.filter((r) => {
      return r.reportingDate && r.metricId && r.programType && (r.metricValue || r.comment);
    }).length;

    return {
      attestations: { complete: attComplete, total: attestationsData.length },
      definitions: { complete: defComplete, total: definitionsData.length },
      data: { complete: dataComplete, total: metricData.length },
    };
  }, [attestationsData, definitionsData, metricData]);

  // ── Export to Excel ───────────────────────────────────────────────
  const exportToExcel = () => {
    const errors = validateAll();
    const totalErrors = Object.values(errors).reduce((s, a) => s + a.length, 0);

    if (totalErrors > 0) {
      const proceed = window.confirm(
        `There are ${totalErrors} validation issue(s). Export anyway?`
      );
      if (!proceed) {
        setShowValidation(true);
        return;
      }
    }

    const wb = XLSX.utils.book_new();

    // CMS Attestations sheet
    const attHeaders = [
      'Module', 'Related System\n(Required)', 'Outcome/\nCEF Reference #',
      'CMS-Required Outcome and CEF Description', 'Outcome/CEF Applicable (Yes/No)',
      'Justification for "No"'
    ];
    const attRows = attestationsData.map((r) => [
      r.module, r.relatedSystem, r.outcomeRef, r.outcomeDesc, r.applicable, r.justification,
    ]);
    const attSheet = XLSX.utils.aoa_to_sheet([attHeaders, ...attRows]);
    XLSX.utils.book_append_sheet(wb, attSheet, 'CMS Attestations');

    // Metric Definitions sheet
    const defHeaders = [
      'Module', 'Related System\n(Required)', 'Outcome/CEF Reference #',
      'State-Specific Outcome Description', 'Metric ID', 'Metric Name',
      'Metric Description', 'Numerator Description', 'Denominator Description',
      'Value Type', 'Metric Reporting Frequency', 'OAPD Metric Status', 'Note'
    ];
    const defRows = definitionsData.map((r) => [
      r.module, r.relatedSystem, r.outcomeRef, r.stateSpecificDesc, r.metricId,
      r.metricName, r.metricDescription, r.numeratorDesc, r.denominatorDesc,
      r.valueType, r.frequency, r.status, r.note,
    ]);
    const defSheet = XLSX.utils.aoa_to_sheet([defHeaders, ...defRows]);
    XLSX.utils.book_append_sheet(wb, defSheet, 'Metric Definitions');

    // Metric Data sheet
    const dataHeaders = [
      'Reporting Date', 'Metric ID', 'Measure Count', 'Measure Count Description (Optional)',
      'Metric Value', 'Numerator', 'Denominator', 'Program Type\n(Required)',
      'Internal State Benchmark (Optional)', 'Comment'
    ];
    const dataRows = metricData.map((r) => [
      r.reportingDate, r.metricId, r.measureCount, r.measureCountDesc,
      r.metricValue, r.numerator, r.denominator, r.programType,
      r.benchmark, r.comment,
    ]);
    const dataSheet = XLSX.utils.aoa_to_sheet([dataHeaders, ...dataRows]);
    XLSX.utils.book_append_sheet(wb, dataSheet, 'Metric Data');

    // Generate filename
    const moduleAbbrevs = [...new Set(attestationsData.map((r) => MODULE_ABBREVIATIONS[r.module]).filter(Boolean))];
    const moduleStr = moduleAbbrevs.join('-') || 'XX';
    const dateStr = new Date().toISOString().split('T')[0];
    const stateStr = settings.stateAbbreviation || 'XX';
    const filename = `Operational_Report_${stateStr}_${moduleStr}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, filename);
  };

  // ── Export to JSON ────────────────────────────────────────────────
  const exportToJson = () => {
    const payload = {
      settings,
      cmsAttestations: attestationsData,
      metricDefinitions: definitionsData,
      metricData,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const stateStr = settings.stateAbbreviation || 'XX';
    const dateStr = new Date().toISOString().split('T')[0];
    a.download = `Operational_Report_${stateStr}_${dateStr}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Import from JSON ──────────────────────────────────────────────
  const importFromJson = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const payload = JSON.parse(ev.target.result);
          applyImportedPayload(payload);
          alert('Data imported successfully!');
        } catch (err) {
          alert('Error importing file: ' + err.message);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const applyImportedPayload = (payload) => {
    if (payload.settings) setSettings(payload.settings);
    if (payload.cmsAttestations) setAttestationsData(payload.cmsAttestations);
    if (payload.metricDefinitions) setDefinitionsData(payload.metricDefinitions);
    if (payload.metricData) setMetricData(payload.metricData);
  };

  const totalErrors = Object.values(validationErrors).reduce((s, a) => s + a.length, 0);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Operational Report Workbook (ORW)</h1>
            <p className="subtitle">MES Metrics — CMS Operational Reporting</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-secondary" onClick={importFromJson} title="Import from JSON">
              📂 Import
            </button>
            <button className="btn btn-secondary" onClick={exportToJson} title="Export as JSON">
              💾 JSON
            </button>
            <button className="btn btn-primary" onClick={exportToExcel} title="Export as Excel">
              📥 Export Excel
            </button>
            <button className="btn btn-secondary" onClick={() => setShowBoxChecks(true)}>
              📋 Box Checks
            </button>
            <button className="btn btn-secondary" onClick={() => setShowBoxExplanation(true)}>
              🧠 Box Checks Explain
            </button>
            <button className="btn btn-secondary" onClick={() => setShowUploadValidation(true)}>
              📤 Upload & Validate
            </button>
            <button
              className={`btn ${totalErrors > 0 ? 'btn-warning' : 'btn-success'}`}
              onClick={() => setShowValidation(true)}
            >
              {totalErrors > 0 ? `⚠️ ${totalErrors} Issues` : '✅ Valid'}
            </button>
          </div>
        </div>
      </header>

      {showBoxChecks ? (
        <BoxImportChecksPage onBack={() => setShowBoxChecks(false)} />
      ) : showBoxExplanation ? (
        <BoxChecksExplanationPage onBack={() => setShowBoxExplanation(false)} />
      ) : showUploadValidation ? (
        <UploadValidationPage onBack={() => setShowUploadValidation(false)} />
      ) : (
        <>
          <SettingsPanel settings={settings} onSettingsChange={setSettings} />

          <TabNavigation
            activeTab={activeTab}
            onTabChange={setActiveTab}
            validationCounts={validationCounts}
          />

          <main className="app-main">
            {activeTab === 'attestations' && (
              <CMSAttestations data={attestationsData} onChange={setAttestationsData} />
            )}
            {activeTab === 'definitions' && (
              <MetricDefinitions
                data={definitionsData}
                onChange={setDefinitionsData}
                settings={settings}
              />
            )}
            {activeTab === 'data' && (
              <MetricData
                data={metricData}
                onChange={setMetricData}
                metricDefinitions={definitionsData}
              />
            )}
          </main>

          <ValidationSummary
            isOpen={showValidation}
            onClose={() => setShowValidation(false)}
            errors={validationErrors}
          />
        </>
      )}
    </div>
  );
}

export default App;
