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

const getSectionPreview = (value) => {
  const text = toDisplayText(value).replace(/\s+/g, " ").trim();

  if (text === "No data available yet.") {
    return text;
  }

  return text.length > 140 ? `${text.slice(0, 140)}...` : text;
};

export default function ResultsViewer({ result }) {
  return (
    <div className="subpanel">
      <div className="section-heading compact">
        <div>
          <h2>Results Viewer</h2>
          <p>Review the generated outputs in structured sections.</p>
        </div>
      </div>

      {result ? (
        <div className="results-stack">
          {RESULT_SECTIONS.map((section, index) => (
            <details className="result-panel" key={section.key} open={index === 0}>
              <summary>
                <span>{section.label}</span>
                <span className="result-panel-preview">
                  {getSectionPreview(result[section.key])}
                </span>
              </summary>
              <pre>{toDisplayText(result[section.key])}</pre>
            </details>
          ))}
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
