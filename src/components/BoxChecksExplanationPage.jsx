function BoxChecksExplanationPage({ onBack }) {
  const sections = [
    {
      title: 'Checks 1 through 39',
      description: 'These checks represent the full validation flow for the imported Box data. They are meant to confirm that the workbook contains complete, consistent, and reviewable information before it is used or exported.',
      bullets: [
        'Check 1: required basic information is present.',
        'Check 2: the record has the expected structure.',
        'Check 3: the imported file is not empty.',
        'Check 4: key identifiers are populated.',
        'Check 5: the submission contains the expected module context.',
        'Check 6: the related system is present.',
        'Check 7: the outcome reference is included.',
        'Check 8: the metric or measure information is present.',
        'Check 9: reporting values are not missing when required.',
        'Check 10: the record is internally consistent.',
        'Check 11: required narrative or explanation text is present.',
        'Check 12: required dates are populated.',
        'Check 13: the imported data follows the expected field order.',
        'Check 14: no required value is duplicated incorrectly.',
        'Check 15: placeholder or default values are not used.',
        'Check 16: optional values do not break the required logic.',
        'Check 17: business-rule compatibility is maintained between related fields.',
        'Check 18: the record meets the expected completion threshold.',
        'Check 19: the data is not missing a required response.',
        'Check 20: the metric definition is complete.',
        'Check 21: the value type is appropriate for the metric.',
        'Check 22: the measurement frequency is populated.',
        'Check 23: the reporting status is present.',
        'Check 24: percentage-based rules include both numerator and denominator detail.',
        'Check 25: the metric data row is not incomplete.',
        'Check 26: the reporting date is reasonable and not blank.',
        'Check 27: the program type is present.',
        'Check 28: comments are present when metric values are absent.',
        'Check 29: no future-dated values are introduced.',
        'Check 30: the integrity of the imported record is preserved.',
        'Check 31: the imported data is aligned with the expected workbook tab.',
        'Check 32: duplicate metric IDs are not present.',
        'Check 33: each attestation row is actionable.',
        'Check 34: the attestation uses the expected response logic.',
        'Check 35: each record is reviewable and understandable.',
        'Check 36: the data is ready for validation output.',
        'Check 37: summary data can be derived from the import.',
        'Check 38: the submission can be safely exported.',
        'Check 39: the final completeness gate is satisfied before the workbook accepts the submission.',
      ],
    },
    {
      title: 'Each attestation',
      description: 'Every attestation row is checked to make sure it contains a usable response, the right supporting context, and any required justification. These checks prevent incomplete or ambiguous attestations from being accepted.',
      bullets: [
        'Each attestation requires a related system value.',
        'Each attestation requires an applicable response.',
        'Each attestation requires a justification when the applicable answer is No.',
        'Each attestation is not accepted when it is incomplete.',
      ],
    },
    {
      title: 'Each precheck',
      description: 'The prechecks run first and catch missing or inconsistent values before the full validation flow continues. They are meant to stop defective records early.',
      bullets: [
        'Each precheck checks for missing required values before the record proceeds.',
        'Each precheck catches incomplete module, metric, outcome, or system information.',
        'Each precheck flags missing narrative text or justification where required.',
        'Each precheck prevents downstream checks from processing obviously broken data.',
      ],
    },
    {
      title: 'How the versioned files fit together',
      description: 'The versioned Box check modules are successive implementations of the same validation concept. Each version can refine the existing checks, add new ones, or adjust logic while preserving the same purpose.',
      bullets: [
        'box_checks.py provides the core validation behavior.',
        'box_checks_V1.py adds the first refinement layer.',
        'box_checks_V2.py introduces the next expansion of the logic.',
        'box_checks_V3.py carries the latest refinement or edge-case handling.',
      ],
    },
  ];

  return (
    <div className="box-import-page">
      <div className="box-import-card">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to form
        </button>

        <h2>Box checks explanation</h2>
        <p>
          This page is intended to explain the validation logic in the Box import Python files.
          The files referenced below are expected to live in the Box import folder for this project.
        </p>

        {sections.map((section) => (
          <div key={section.title}>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
            <ul>
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoxChecksExplanationPage;
