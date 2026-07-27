function BoxChecksExplanationPage({ onBack }) {
  const sections = [
    {
      title: 'Check 39',
      description: 'This check verifies that the imported Box data satisfies the core requirement for the workbook to proceed. It acts as a high-level gate for whether the submission is considered complete enough to process.',
      bullets: [
        'Ensures the imported record is not missing critical content.',
        'Confirms that the data is structurally usable for downstream validation.',
        'Flags the submission when a required component is absent or incomplete.',
      ],
    },
    {
      title: 'Each attestation check',
      description: 'Each attestation is reviewed to confirm that the required evidence and response values are present. These checks make sure the attestation reflects a real, reviewable answer rather than an empty or incomplete entry.',
      bullets: [
        'Confirms the attestation has a related system value.',
        'Ensures an applicability answer is present.',
        'Requires a justification when the response is marked as No.',
        'Prevents the form from accepting incomplete attestation entries.',
      ],
    },
    {
      title: 'Each precheck',
      description: 'The prechecks are the early validation steps that screen the imported data before the full workbook logic runs. They help catch missing or inconsistent information up front.',
      bullets: [
        'Verifies that required fields are populated before the record moves forward.',
        'Catches missing required values such as module, metric, or outcome references.',
        'Surfaces obvious data issues early so the user can correct them before export.',
        'Supports consistent handling of incomplete submissions across versions of the Box import logic.',
      ],
    },
    {
      title: 'How the versioned files fit together',
      description: 'The versioned Box check modules are intended to represent successive iterations of the same validation logic. Each version can refine, expand, or adjust the checks while preserving the same overall purpose.',
      bullets: [
        'box_checks.py provides the base validation behavior.',
        'box_checks_V1.py adds the first refinement layer.',
        'box_checks_V2.py introduces the next set of updates.',
        'box_checks_V3.py carries the later refinement or edge-case handling.',
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
