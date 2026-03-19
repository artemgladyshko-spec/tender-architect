import PipelineStep from "./PipelineStep";

export default function PipelineBlock({
  blockId,
  title,
  description,
  steps,
  expanded,
  onToggle,
  onSelectStep,
  selectedStepId,
}) {
  return (
    <div className={`phase-card ${expanded ? "expanded" : "collapsed"}`}>
      <button type="button" className="phase-card-toggle" onClick={onToggle}>
        <div className="phase-card-header">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
        <span className={`phase-card-chevron ${expanded ? "expanded" : ""}`}>
          <svg viewBox="0 0 24 24" role="presentation">
            <path d="m7.41 8.59 4.59 4.58 4.59-4.58L18 10l-6 6-6-6z" />
          </svg>
        </span>
      </button>

      {expanded ? (
        <div className="pipeline-list">
          {steps.map((step, index) => (
            <PipelineStep
              key={step.id}
              index={index}
              isSelected={selectedStepId === step.id}
              onSelect={(selectedStep) => onSelectStep(blockId, selectedStep)}
              step={step}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
