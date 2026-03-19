const TABS = [
  { id: "analysis", label: "Analysis" },
  { id: "architecture", label: "Architecture" },
  { id: "proposal", label: "Proposal" },
  { id: "consistency", label: "Consistency" },
];

const toDisplayText = (value) => {
  if (value === null || value === undefined || value === "") {
    return "No data available yet.";
  }
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
};

const extractConsistencyIssues = (result, proposalResult) => {
  const candidate =
    result?.validation?.issues ||
    result?.validation?.findings ||
    proposalResult?.consistency?.issues ||
    proposalResult?.issues ||
    [];

  if (Array.isArray(candidate)) {
    return candidate;
  }
  if (typeof candidate === "string" && candidate.trim()) {
    return [candidate];
  }
  if (candidate && typeof candidate === "object") {
    return Object.entries(candidate).map(
      ([key, value]) => `${key}: ${typeof value === "string" ? value : JSON.stringify(value)}`,
    );
  }
  return [];
};

function ResultsSection({ title, value }) {
  return (
    <div className="result-card">
      <div className="result-card-header">
        <h3>{title}</h3>
      </div>
      <pre>{toDisplayText(value)}</pre>
    </div>
  );
}

export default function ResultsTabs({
  activeTab,
  onTabChange,
  result,
  proposalResult,
}) {
  const proposalMarkdown =
    proposalResult?.proposal ||
    proposalResult?.markdown ||
    proposalResult?.results?.proposal ||
    "";
  const consistencyIssues = extractConsistencyIssues(result, proposalResult);

  return (
    <div className="subpanel">
      <div className="section-heading compact">
        <div>
          <h2>Results Viewer</h2>
          <p>Inspect outputs by phase instead of browsing one flat dump.</p>
        </div>
      </div>

      <div className="results-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`results-tab-button ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "analysis" ? (
        result ? (
          <div className="results-grid">
            <ResultsSection title="Requirements" value={result.requirements} />
            <ResultsSection title="Actors" value={result.actors} />
            <ResultsSection title="Patterns" value={result.patterns} />
          </div>
        ) : (
          <div className="empty-state">
            <strong>No analysis output yet.</strong>
            <p>Upload a file and run the pipeline to populate this tab.</p>
          </div>
        )
      ) : null}

      {activeTab === "architecture" ? (
        result ? (
          <div className="results-grid">
            <ResultsSection title="System" value={result.system} />
            <ResultsSection title="PBS" value={result.pbs} />
            <ResultsSection title="Dependencies" value={result.dependencies} />
            <ResultsSection title="Domain Model" value={result.domainModel} />
            <ResultsSection title="API" value={result.api} />
          </div>
        ) : (
          <div className="empty-state">
            <strong>No architecture output yet.</strong>
            <p>Complete analysis to inspect the system design artifacts.</p>
          </div>
        )
      ) : null}

      {activeTab === "proposal" ? (
        proposalMarkdown ? (
          <ResultsSection title="Rendered Markdown" value={proposalMarkdown} />
        ) : (
          <div className="empty-state">
            <strong>No proposal markdown yet.</strong>
            <p>Run the proposal pipeline to view the rendered document.</p>
          </div>
        )
      ) : null}

      {activeTab === "consistency" ? (
        consistencyIssues.length > 0 ? (
          <div className="result-card">
            <div className="result-card-header">
              <h3>Consistency Issues</h3>
            </div>
            <ul className="issues-list">
              {consistencyIssues.map((issue, index) => (
                <li key={`${issue}-${index}`}>{issue}</li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="empty-state">
            <strong>No consistency issues reported.</strong>
            <p>Validation results will appear here when the backend provides them.</p>
          </div>
        )
      ) : null}
    </div>
  );
}
