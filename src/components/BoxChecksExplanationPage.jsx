function BoxChecksExplanationPage({ onBack }) {
  const sections = [
    {
      title: 'Business checks',
      description: 'These are the numbered checks marked with # Check in the supplied box_checks.py file. A result is shown only when a check finds a problem.',
      checks: [
        ['Check 1', 'Each Metric Definitions row must have a Metric ID.'],
        ['Check 3', 'Each Metric Definitions row must have a Metric Name.'],
        ['Check 6', 'Each Metric Definitions row must have a Metric Description.'],
        ['Check 9', 'Each Metric Definitions row must have a Value Type.'],
        ['Check 22', 'Each Metric Data row must have a Metric ID.'],
        ['Check 24', 'Each Metric Data row must have a Measure Count.'],
        ['Check 27', 'Each Metric Data row must have a Numerator.'],
        ['Check 28', 'Each Metric Data row must have a Denominator.'],
        ['Check 29', 'When a Numerator is entered, it must be a number. Blank values are handled by Check 27.'],
        ['Check 30', 'When a Denominator is entered, it must be a number. Blank values are handled by Check 28.'],
        ['Check 32', 'When a Measure Count is entered, it must be a whole number. Blank values are handled by Check 24.'],
        ['Check 35', 'Every Metric ID reported on Metric Data must also appear on Metric Definitions.'],
        ['Check 37', 'Each Metric Data row must have a Program Type.'],
        ['Check 38', 'Each populated Metric ID on Metric Definitions must use a Module that is in the approved module list.'],
        ['Check 39', 'If any reported Metric ID contains “IO”, the file must also report both state-specific IOPAA IDs: [State]-CR-IOPAA-01.1 and [State]-CR-IOPAA-01.2.'],
      ],
    },
    {
      title: 'Attestation checks',
      description: 'These checks are marked # Attestation in the supplied file and apply to the CMS Attestations tab.',
      checks: [
        ['Attestation 1', 'Every attestation must identify its Related System.'],
        ['Attestation 2', 'Every attestation must say whether the outcome is applicable.'],
        ['Attestation 3', 'When Outcome Applicable is “No”, a Justification is required.'],
        ['Attestation 4', 'The CMS Attestations tab cannot be empty.'],
        ['Attestation 5', 'For each Related System and Module used in Metric Definitions, the attestation tab must include every required non-CEF outcome for that module and system.'],
        ['Attestation 6', 'For every Related System, at least one module must include all 22 CEF attestations (CEF01 through CEF22).'],
        ['Attestation 7', 'The Related System names used on CMS Attestations and Metric Definitions must match, ignoring capitalization.'],
      ],
    },
    {
      title: 'Prechecks',
      description: 'These run before the business checks. They confirm that the uploaded workbook has the required structure and data.',
      checks: [
        ['Precheck 1', 'The uploaded file must be an Excel workbook.'],
        ['Precheck 2', 'The workbook must have exactly one Metric Definitions tab and exactly one Metric Values or Metric Data tab. Version 3 workbooks must also have exactly one CMS Attestations tab.'],
        ['Precheck 3', 'The filename must end with an underscore followed by a valid date in YYYY-MM-DD format.'],
        ['Precheck 5', 'The required column headers must be present on the Metric Definitions, Metric Data, and CMS Attestations tabs.'],
        ['Precheck 6', 'Metric Definitions and Metric Values/Metric Data must each contain at least one row of data.'],
      ],
    },
  ];

  return (
    <main className="box-import-page">
      <div className="box-import-card">
        <button className="btn btn-secondary" onClick={onBack}>← Back to form</button>
        <h2>Box checks explained</h2>
        <p>Plain-English descriptions of the checks supplied from <code>box_checks.py</code>.</p>
        {sections.map((section) => (
          <section key={section.title} className="validation-section" aria-labelledby={section.title.replaceAll(' ', '-')}>
            <h3 id={section.title.replaceAll(' ', '-')}>{section.title}</h3>
            <p>{section.description}</p>
            <dl>
              {section.checks.map(([label, description]) => (
                <div key={label}>
                  <dt><strong>{label}</strong></dt>
                  <dd>{description}</dd>
                </div>
              ))}
            </dl>
          </section>
        ))}
      </div>
    </main>
  );
}

export default BoxChecksExplanationPage;
