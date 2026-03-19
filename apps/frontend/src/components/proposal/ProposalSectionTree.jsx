const STATUS_LABELS = {
  pending: "pending",
  running: "running",
  completed: "completed",
  failed: "failed",
};

export default function ProposalSectionTree({ proposalSections }) {
  return (
    <div className="subpanel">
      <div className="section-heading compact">
        <div>
          <h2>Proposal Engine</h2>
          <p>Each section is tracked through structure, content, and review.</p>
        </div>
      </div>

      <div className="proposal-tree">
        {proposalSections.map((section) => (
          <div className={`proposal-section-card ${section.status}`} key={section.id}>
            <div className="proposal-section-header">
              <div>
                <strong>{section.label}</strong>
                <p>{STATUS_LABELS[section.status]}</p>
              </div>
              <span className={`pipeline-badge ${section.status}`}>
                {STATUS_LABELS[section.status]}
              </span>
            </div>

            <div className="proposal-substeps">
              {section.children.map((child) => (
                <div className={`proposal-substep ${child.status}`} key={child.id}>
                  <span>{child.label}</span>
                  <span className={`pipeline-badge ${child.status}`}>
                    {STATUS_LABELS[child.status]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
