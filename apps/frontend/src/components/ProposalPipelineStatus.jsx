const STATUS_LABELS = {
  pending: "Pending",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
};

function ProposalPipelineStatusIcon({ status, index }) {
  if (status === "completed") {
    return (
      <span className="pipeline-icon pipeline-icon-completed" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="presentation">
          <path d="M9.55 16.6 5.4 12.45l-1.4 1.4 5.55 5.55L20 8.95l-1.4-1.4z" />
        </svg>
      </span>
    );
  }

  if (status === "running") {
    return <span className="pipeline-icon pipeline-spinner" aria-hidden="true" />;
  }

  if (status === "failed") {
    return (
      <span className="pipeline-icon pipeline-icon-failed" aria-hidden="true">
        <svg viewBox="0 0 24 24" role="presentation">
          <path d="m12 10.59 4.95-4.95 1.41 1.41L13.41 12l4.95 4.95-1.41 1.41L12 13.41l-4.95 4.95-1.41-1.41L10.59 12 5.64 7.05l1.41-1.41z" />
        </svg>
      </span>
    );
  }

  return <span>{index + 1}</span>;
}

export default function ProposalPipelineStatus({ proposalSteps }) {
  return (
    <div className="subpanel">
      <div className="section-heading compact">
        <div>
          <h2>Proposal Pipeline Status</h2>
          <p>Track generation of each CMU Resolution 205 proposal section.</p>
        </div>
      </div>

      <div className="pipeline-list pipeline-list-horizontal">
        {proposalSteps.map((step, index) => (
          <div className={`pipeline-item ${step.status}`} key={step.id}>
            <div className="pipeline-marker">
              <ProposalPipelineStatusIcon index={index} status={step.status} />
            </div>

            <div className="pipeline-copy">
              <strong>{step.label}</strong>
              <p>{STATUS_LABELS[step.status]}</p>
            </div>

            <span className={`pipeline-badge ${step.status}`}>
              {STATUS_LABELS[step.status]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
