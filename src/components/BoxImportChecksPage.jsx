function BoxImportChecksPage({ onBack }) {
  const sections = [
    {
      title: 'Settings checks',
      items: [
        'State abbreviation is required.',
        'State abbreviation must be exactly 2 characters.',
      ],
    },
    {
      title: 'Attestations checks',
      items: [
        'Related system is required.',
        'Applicable selection is required.',
        'Justification is required when the answer is No.',
      ],
    },
    {
      title: 'Metric definition checks',
      items: [
        'Module is required.',
        'Related system is required.',
        'Outcome or CEF reference is required.',
        'Metric ID is required.',
        'Metric name is required.',
        'Metric description is required.',
        'Value type is required.',
        'Reporting frequency is required.',
        'Status is required.',
        'Numerator and denominator descriptions are required for percentage-based metrics.',
        'Duplicate metric IDs are not allowed.',
      ],
    },
    {
      title: 'Metric data checks',
      items: [
        'Reporting date is required.',
        'Metric ID is required.',
        'Program type is required.',
        'A comment is required when metric value is missing.',
        'Dates cannot be in the future.',
      ],
    },
  ];

  return (
    <div className="box-import-page">
      <div className="box-import-card">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to form
        </button>

        <h2>Box Import checks</h2>
        <p>
          This page summarizes the validation checks that the workbook applies to the imported data.
        </p>

        {sections.map((section) => (
          <div key={section.title}>
            <h3>{section.title}</h3>
            <ul>
              {section.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoxImportChecksPage;
