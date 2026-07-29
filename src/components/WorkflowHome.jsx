const WORKFLOWS = [
  {
    id: 'create',
    number: '01',
    title: 'Create a Box-compliant ORW submission',
    description: 'Start a new Operational Report Workbook and move through each required reporting step.',
    steps: ['Choose state and abbreviation', 'Select attestations', 'Add metric definitions', 'Enter metric data', 'Export to Excel for Box', 'Export JSON for future reporting'],
    action: 'Start a new submission',
  },
  {
    id: 'import',
    number: '02',
    title: 'Continue a previous ORW submission',
    description: 'Import a saved ORW JSON file, update the report, and prepare the next submission.',
    steps: ['Import previous ORW JSON', 'Update attestations and definitions', 'Input metric data', 'Export to Excel for Box', 'Export JSON for future reporting'],
    action: 'Import ORW JSON',
  },
  {
    id: 'validate',
    number: '03',
    title: 'Validate an ORW before submitting to Box',
    description: 'Upload an existing workbook and review the Box validation results before submission.',
    steps: ['Upload an ORW Excel workbook', 'Review validation results', 'Resolve issues before Box submission'],
    action: 'Upload and validate',
  },
  {
    id: 'learn',
    number: '04',
    title: 'Learn about ORW submission checks',
    description: 'Read each Box validation rule in plain language before you begin.',
    steps: ['Review business checks', 'Review prechecks', 'Understand the expected fixes'],
    action: 'Explore submission checks',
  },
];

export default function WorkflowHome({ onChoose }) {
  return (
    <main className="workflow-home" id="main-content">
      <section className="workflow-hero" aria-labelledby="workflow-title">
        <p className="eyebrow">ORW submission workspace</p>
        <h2 id="workflow-title">What would you like to do?</h2>
        <p>Choose a path to create, continue, validate, or understand an Operational Report Workbook submission.</p>
      </section>

      <section className="workflow-grid" aria-label="ORW workflow options">
        {WORKFLOWS.map((workflow) => (
          <article className="workflow-card" key={workflow.id}>
            <div className="workflow-card-heading">
              <span className="workflow-number" aria-hidden="true">{workflow.number}</span>
              <h3>{workflow.title}</h3>
            </div>
            <p>{workflow.description}</p>
            <ol>
              {workflow.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <button className="btn btn-primary" onClick={() => onChoose(workflow.id)}>{workflow.action}</button>
          </article>
        ))}
      </section>
    </main>
  );
}
