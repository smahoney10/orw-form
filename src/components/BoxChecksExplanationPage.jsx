function BoxChecksExplanationPage({ onBack }) {
  const sections = [
    {
      title: 'Checks 1 through 39',
      description: 'These checks represent the full validation flow for the imported Box data. They are meant to confirm that the workbook contains complete, consistent, and reviewable information before it is used or exported.',
      bullets: [
        'Check 1: verifies that required basic information is present.',
        'Check 2: confirms the record has the expected structure.',
        'Check 3: validates that the imported file is not empty.',
        'Check 4: ensures key identifiers are populated.',
        'Check 5: confirms the submission contains the expected module context.',
        'Check 6: validates that the related system is present.',
        'Check 7: ensures the outcome reference is included.',
        'Check 8: checks that the metric or measure information is present.',
        'Check 9: verifies that reporting values are not missing when required.',
        'Check 10: confirms the record is internally consistent.',
        'Check 11: validates the presence of required narrative or explanation text.',
        'Check 12: checks that required dates are populated.',
        'Check 13: confirms the imported data follows the expected field order.',
        'Check 14: verifies that no required value is duplicated incorrectly.',
        'Check 15: checks for placeholder or default values that should not be used.',
        'Check 16: ensures optional values do not break the required logic.',
        'Check 17: validates business-rule compatibility between related fields.',
        'Check 18: confirms the record meets the expected completion threshold.',
        'Check 19: checks that the data is not missing a required response.',
        'Check 20: validates that the metric definition is complete.',
        'Check 21: ensures the value type is appropriate for the metric.',
        'Check 22: confirms the measurement frequency is populated.',
        'Check 23: checks that the reporting status is present.',
        'Check 24: validates that percentage-based rules include both numerator and denominator detail.',
        'Check 25: ensures the metric data row is not incomplete.',
        'Check 26: confirms the reporting date is reasonable and not blank.',
        'Check 27: validates that the program type is present.',
        'Check 28: checks for missing comments when metric values are absent.',
        'Check 29: confirms no future-dated values are introduced.',
        'Check 30: validates the integrity of the imported record as a whole.',
        'Check 31: confirms the imported data is aligned with the expected workbook tab.',
        'Check 32: checks for duplicate metric IDs.',
        'Check 33: ensures each attestation row is actionable.',
        'Check 34: validates that the attestation uses the expected response logic.',
        'Check 35: confirms that each record is reviewable and understandable.',
        'Check 36: checks that the data is ready for validation output.',
        'Check 37: verifies that summary data can be derived from the import.',
        'Check 38: confirms the submission can be safely exported.',
        'Check 39: serves as the final completeness gate before the workbook accepts the submission.',
      ],
    },
    {
      title: 'Each attestation',
      description: 'Every attestation row is checked to make sure it contains a usable response, the right supporting context, and any required justification. These checks prevent incomplete or ambiguous attestations from being accepted.',
      bullets: [
        'Requires a related system value.',
        'Requires an applicable response.',
        'Requires a justification when the applicable answer is No.',
        'Keeps the attestation row from being accepted when it is incomplete.',
      ],
    },
    {
      title: 'Each precheck',
      description: 'The prechecks run first and catch missing or inconsistent values before the full validation flow continues. They are meant to stop defective records early.',
      bullets: [
        'Checks for missing required values before the record proceeds.',
        'Catches incomplete module, metric, outcome, or system information.',
        'Flags missing narrative text or justification where required.',
        'Prevents downstream checks from processing obviously broken data.',
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
