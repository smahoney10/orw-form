function BoxImportPage({ onBack }) {
  return (
    <div className="box-import-page">
      <div className="box-import-card">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to form
        </button>

        <h2>Box Import Notebook — Plain English</h2>
        <p>
          This notebook is designed to help move data into the ORW workflow from a Box-based source.
          In plain English, it reads a file that was placed in Box, prepares the contents for use,
          and makes the information available in a format that the form can work with.
        </p>

        <h3>What the notebook does</h3>
        <ul>
          <li>Finds the relevant import file or dataset.</li>
          <li>Reads the contents from the Box-connected source.</li>
          <li>Converts the data into a usable structure for the application.</li>
          <li>Checks that the imported content is complete enough to use.</li>
          <li>Passes the information into the form so the user can review or export it.</li>
        </ul>

        <h3>How it helps the user</h3>
        <p>
          Instead of manually copying information from Box into the workbook, the notebook automates the
          import step. This saves time, reduces manual entry errors, and keeps the data flowing from the
          source system into the reporting workflow.
        </p>

        <h3>In short</h3>
        <p>
          The Box Import notebook acts as a bridge between Box-stored data and the ORW form. It takes the
          source information, prepares it, and makes it ready for downstream use in the reporting process.
        </p>
      </div>
    </div>
  );
}

export default BoxImportPage;
