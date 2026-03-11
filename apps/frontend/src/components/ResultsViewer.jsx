const RESULT_SECTIONS = [
  { key: "requirements", label: "Requirements" },
  { key: "actors", label: "Actors" },
  { key: "architecture", label: "Architecture" },
  { key: "database", label: "Database" },
  { key: "api", label: "API" },
  { key: "estimation", label: "Estimation" },
  { key: "projectPlan", label: "Project Plan" },
];

const toDisplayText = (value) => {
  if (value === null || value === undefined) {
    return "No data available yet.";
  }

  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
};

export default function ResultsViewer({ result }) {
  return (
    <div className="subpanel">
      <div className="section-heading compact">
        <div>
          <h2>Results Viewer</h2>
          <p>Review structured outputs or inspect the full pipeline result.</p>
        </div>
      </div>

      {result ? (
        <div className="results-stack">
          {RESULT_SECTIONS.map((section) => (
            <details className="result-panel" key={section.key}>
              <summary>{section.label}</summary>
              <pre>{toDisplayText(result[section.key])}</pre>
            </details>
          ))}

          <details className="result-panel" open>
            <summary>Pipeline Result JSON</summary>
            <pre>{JSON.stringify(result, null, 2)}</pre>
          </details>
        </div>
      ) : (
        <div className="empty-state">
          <strong>No analysis output yet.</strong>
          <p>Upload a file and run the pipeline to populate the results viewer.</p>
        </div>
      )}
    </div>
  );
}
