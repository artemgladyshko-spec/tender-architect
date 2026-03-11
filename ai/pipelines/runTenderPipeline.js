const fs = require("fs");
const path = require("path");
const analyzerAgent = require("../agents/analyzerAgent");
const architectAgent = require("../agents/architectAgent");
const estimatorAgent = require("../agents/estimatorAgent");
const projectManagerAgent = require("../agents/projectManagerAgent");
const proposalAgent = require("../agents/proposalAgent");
const runPrompt = require("./runPrompt");

const rootDir = path.resolve(__dirname, "..", "..");
const analysisDir = path.join(rootDir, "data", "outputs", "analysis");

const saveJson = (filename, value) => {
  fs.mkdirSync(analysisDir, { recursive: true });
  fs.writeFileSync(
    path.join(analysisDir, filename),
    JSON.stringify(value, null, 2),
    "utf8",
  );
};

const createStatusTracker = (onStatusUpdate) => {
  const pipelineStatus = [];

  const updateStatus = (step, status) => {
    const entry = {
      step,
      status,
      updatedAt: new Date().toISOString(),
    };

    pipelineStatus.push(entry);
    console.log(`[Pipeline] ${step}: ${status}`);

    if (typeof onStatusUpdate === "function") {
      onStatusUpdate(entry, [...pipelineStatus]);
    }
  };

  return {
    pipelineStatus,
    updateStatus,
  };
};

async function runTenderPipeline(input, options = {}) {
  const results = {};
  const documentText = input.tor || "";
  const { pipelineStatus, updateStatus } = createStatusTracker(
    options.onStatusUpdate,
  );

  try {
    updateStatus("analyzerAgent", "running");
    const analysis = await analyzerAgent(documentText);
    results.requirements = analysis.requirements;
    results.actors = analysis.actors;
    results.patterns = analysis.architecturePatterns;
    results.architecturePatterns = analysis.architecturePatterns;
    saveJson("sections.json", analysis.sections);
    saveJson("chunks.json", analysis.chunks);
    updateStatus("analyzerAgent", "completed");

    updateStatus("pbsGenerator", "running");
    results.pbs = await runPrompt("pbs_generator.md", {
      requirements: results.requirements,
      actors: results.actors,
      architecturePatterns: results.architecturePatterns,
    });
    updateStatus("pbsGenerator", "completed");

    updateStatus("architectAgent", "running");
    const architectureOutput = await architectAgent({
      requirements: results.requirements,
      actors: results.actors,
      architecturePatterns: results.architecturePatterns,
      pbs: results.pbs,
    });
    results.domain = architectureOutput.domainModel;
    results.domainModel = architectureOutput.domainModel;
    results.architecture = architectureOutput.architecture;
    results.database = architectureOutput.database;
    results.api = architectureOutput.api;
    updateStatus("architectAgent", "completed");

    updateStatus("traceabilityMapper", "running");
    results.traceability = await runPrompt("traceability_mapper.md", {
      requirements: results.requirements,
      pbs: results.pbs,
      architecture: results.architecture,
      api: results.api,
      database: results.database,
    });
    updateStatus("traceabilityMapper", "completed");

    updateStatus("estimatorAgent", "running");
    const estimationOutput = await estimatorAgent({
      pbs: results.pbs,
      architecture: results.architecture,
      api: results.api,
      database: results.database,
    });
    results.estimation = estimationOutput.raw;
    results.estimationDetails = estimationOutput;
    updateStatus("estimatorAgent", "completed");

    updateStatus("projectManagerAgent", "running");
    const projectPlanOutput = await projectManagerAgent({
      architecture: results.architecture,
      pbs: results.pbs,
      estimation: results.estimation,
    });
    results.projectPlan = projectPlanOutput.raw;
    results.projectPlanDetails = projectPlanOutput;
    updateStatus("projectManagerAgent", "completed");

    updateStatus("proposalAgent", "running");
    results.proposal = await proposalAgent({
      requirements: results.requirements,
      actors: results.actors,
      architecturePatterns: results.architecturePatterns,
      pbs: results.pbs,
      domainModel: results.domainModel,
      architecture: results.architecture,
      database: results.database,
      api: results.api,
      traceability: results.traceability,
      estimation: results.estimation,
      estimationDetails: results.estimationDetails,
      projectPlan: results.projectPlan,
      projectPlanDetails: results.projectPlanDetails,
    });
    updateStatus("proposalAgent", "completed");

    results.pipelineStatus = pipelineStatus;
    return results;
  } catch (error) {
    updateStatus("pipeline", "failed");
    throw error;
  }
}

module.exports = runTenderPipeline;
