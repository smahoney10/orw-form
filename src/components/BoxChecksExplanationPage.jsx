function BoxChecksExplanationPage({ onBack }) {
  const files = [
    {
      name: 'box_checks.py',
      path: '/Users/sean.mahoney@cms.hhs.gov/SPoTT/box_import/box_module/box_checks.py',
      description: 'The base Box validation module that defines the core checks used by the import workflow.',
    },
    {
      name: 'box_checks_V1.py',
      path: '/Users/sean.mahoney@cms.hhs.gov/SPoTT/box_import/box_module/box_checks_V1.py',
      description: 'A versioned validation module that builds on the base checks with the first set of refinements.',
    },
    {
      name: 'box_checks_V2.py',
      path: '/Users/sean.mahoney@cms.hhs.gov/SPoTT/box_import/box_module/box_checks_V2.py',
      description: 'A second version of the validation logic with updated or expanded checks.',
    },
    {
      name: 'box_checks_V3.py',
      path: '/Users/sean.mahoney@cms.hhs.gov/SPoTT/box_import/box_module/box_checks_V3.py',
      description: 'A later version of the validation logic that may include additional edge-case checks or refinements.',
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

        {files.map((file) => (
          <div key={file.name}>
            <h3>{file.name}</h3>
            <p>
              <strong>Path:</strong> {file.path}
            </p>
            <p>{file.description}</p>
            <ul>
              <li>Checks whether required fields are present.</li>
              <li>Verifies that values meet expected formats or allowed options.</li>
              <li>Flags duplicates, missing explanations, or invalid dates.</li>
              <li>Returns issues that can be shown to the user or exported with the workbook.</li>
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoxChecksExplanationPage;
