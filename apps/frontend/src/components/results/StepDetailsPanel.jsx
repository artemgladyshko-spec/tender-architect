const DETAIL_TABS = [
  { id: "view", label: "View" },
  { id: "json", label: "JSON" },
  { id: "preview", label: "Preview" },
];

const toDisplayText = (value) => {
  if (value === null || value === undefined || value === "") {
    return "No data available yet.";
  }
  return typeof value === "string" ? value : JSON.stringify(value, null, 2);
};

function renderView(detail) {
  if (!detail?.sections?.length) {
    return (
      <div className="empty-state compact">
        <strong>No details available.</strong>
        <p>Select a step with generated data.</p>
      </div>
    );
  }

  return (
    <div className="details-view">
      {detail.sections.map((section) => (
        <div className="detail-card" key={section.title}>
          <h4>{section.title}</h4>
          <pre>{toDisplayText(section.value)}</pre>
        </div>
      ))}
    </div>
  );
}

function renderJson(detail) {
  return (
    <div className="detail-card">
      <h4>Raw Payload</h4>
      <pre>{toDisplayText(detail?.json)}</pre>
    </div>
  );
}

function renderPreview(detail) {
  return (
    <div className="detail-card preview-card">
      <h4>Preview</h4>
      <pre>{toDisplayText(detail?.preview)}</pre>
    </div>
  );
}

export default function StepDetailsPanel({
  detail,
  activeTab,
  onTabChange,
}) {
  return (
    <div className="subpanel details-panel">
      <div className="section-heading compact">
        <div>
          <h2>{detail?.title || "Details"}</h2>
          <p>{detail?.description || "Select a step to inspect its state."}</p>
        </div>
      </div>

      <div className="results-tabs details-tabs">
        {DETAIL_TABS.map((tab) => (
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

      <div className="details-body">
        {activeTab === "view" ? renderView(detail) : null}
        {activeTab === "json" ? renderJson(detail) : null}
        {activeTab === "preview" ? renderPreview(detail) : null}
      </div>
    </div>
  );
}
