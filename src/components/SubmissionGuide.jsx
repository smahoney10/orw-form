export default function SubmissionGuide({ steps, currentStep, onStepChange, children }) {
  const current = steps[currentStep];
  return (
    <main className="submission-workspace" id="main-content">
      <nav className="submission-steps" aria-label="Submission progress">
        <p className="eyebrow">Guided submission</p>
        <ol>
          {steps.map((step, index) => (
            <li key={step.title} className={index === currentStep ? 'is-current' : index < currentStep ? 'is-complete' : ''}>
              <button type="button" onClick={() => onStepChange(index)} aria-current={index === currentStep ? 'step' : undefined}>
                <span>{index + 1}</span>{step.title}
              </button>
            </li>
          ))}
        </ol>
      </nav>
      <section className="submission-stage" aria-labelledby="stage-title">
        <p className="stage-count">Step {currentStep + 1} of {steps.length}</p>
        <h2 id="stage-title">{current.title}</h2>
        <p>{current.description}</p>
        <div className="stage-content">{children}</div>
        <div className="stage-actions">
          {currentStep > 0 ? <button className="btn btn-secondary" onClick={() => onStepChange(currentStep - 1)}>Back</button> : null}
          {currentStep < steps.length - 1 ? <button className="btn btn-primary" onClick={() => onStepChange(currentStep + 1)}>Continue</button> : null}
        </div>
      </section>
    </main>
  );
}
