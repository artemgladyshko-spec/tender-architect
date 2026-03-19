const analyzerAgent = require("../agents/analyzerAgent");
const contractAnalysisAgent = require("../agents/contractAnalysisAgent");
const systemThinkingAgent = require("../agents/systemThinkingAgent");
const architecturePatternAgent = require("../agents/architecturePatternAgent");

const pbsAgent = require("../agents/pbsAgent");
const dependencyMapper = require("../agents/dependencyMapper");

const architectAgent = require("../agents/architectAgent");
const validationAgent = require("../agents/validationAgent");

const estimatorAgent = require("../agents/estimatorAgent");
const projectManagerAgent = require("../agents/projectManagerAgent");
const proposalAgent = require("../agents/proposalAgent");

const runPrompt = require("./runPrompt");

// 🔥 NEW: unified model
const buildUnifiedModel = require("../core/buildUnifiedModel");

async function runTenderPipeline(input, options = {}) {
  const { onStatusUpdate } = options;

  const update = (step, status) => {
    if (onStatusUpdate) {
      onStatusUpdate({ step, status });
    }
  };

  try {
    // =========================
    // 1. ANALYSIS
    // =========================
    update("analyzerAgent", "running");

    const analysis = await analyzerAgent({
      tor: input.tor,
    });

    update("analyzerAgent", "done");

    // =========================
    // 2. CONTRACT ANALYSIS
    // =========================
    update("contractAnalysisAgent", "running");

    const contract = await contractAnalysisAgent({
      attachments: input.attachments || [],
    });

    update("contractAnalysisAgent", "done");

    // =========================
    // 3. SYSTEM THINKING
    // =========================
    update("systemThinkingAgent", "running");

    const systemModel = await systemThinkingAgent({
      requirements: analysis.requirements,
      integrations: analysis.integrations,
      actors: analysis.actors,
      constraints: analysis.constraints,
      contract,
    });

    update("systemThinkingAgent", "done");

    // =========================
    // 3.5 PATTERN DETECTION 🔥
    // =========================
    update("architecturePatternAgent", "running");

    const patterns = await architecturePatternAgent({
      requirements: analysis.requirements,
      system: systemModel,
    });

    update("architecturePatternAgent", "done");

    // =========================
    // 4. PBS
    // =========================
    update("pbsAgent", "running");

    const pbs = await pbsAgent({
      requirements: analysis.requirements,
      system: systemModel,
      patterns,
    });

    update("pbsAgent", "done");

    // =========================
    // 5. DEPENDENCIES
    // =========================
    update("dependencyMapper", "running");

    const dependencies = await dependencyMapper({
      pbs,
    });

    update("dependencyMapper", "done");

    // =========================
    // 6. ARCHITECTURE
    // =========================
    update("architectAgent", "running");

    const architectureResult = await architectAgent({
      requirements: analysis,
      system: systemModel,
      pbs,
      dependencies,
      patterns,
    });

    update("architectAgent", "done");

    const {
      domainModel,
      architecture,
      database,
      api,
      orchestration,
    } = architectureResult;

    // =========================
    // 7. VALIDATION
    // =========================
    update("validationAgent", "running");

    const validation = await validationAgent({
      system: systemModel,
      pbs,
      dependencies,
      domainModel,
      architecture,
      api,
      patterns, // 🔥 IMPORTANT
    });

    update("validationAgent", "done");

    // =========================
    // 8. TRACEABILITY
    // =========================
    update("traceabilityMapper", "running");

    const traceability = await runPrompt(
      "modeling/traceability-mapper.md",
      {
        requirements: JSON.stringify(analysis.requirements),
        pbs: JSON.stringify(pbs),
        patterns: JSON.stringify(patterns),
      }
    );

    update("traceabilityMapper", "done");

    // =========================
    // 9. ESTIMATION
    // =========================
    update("estimatorAgent", "running");

    const estimation = await estimatorAgent({
      pbs,
      dependencies,
      system: systemModel,
      patterns,
    });

    update("estimatorAgent", "done");

    // =========================
    // 10. PROJECT PLAN
    // =========================
    update("projectManagerAgent", "running");

    const projectPlan = await projectManagerAgent({
      pbs,
      dependencies,
      estimation,
      contract,
      patterns,
    });

    update("projectManagerAgent", "done");

    // =========================
    // 🔥 11. BUILD UNIFIED MODEL (CRITICAL STEP)
    // =========================
    const unifiedModel = buildUnifiedModel({
      analysis,
      contract,
      system: systemModel,
      pbs,
      dependencies,
      domainModel,
      architecture,
      database,
      api,
      validation,
    });

    // =========================
    // 12. PROPOSAL (NOW BASED ON MODEL)
    // =========================
    update("proposalAgent", "running");

    const proposal = await proposalAgent({
      unifiedModel, // 🔥 MAIN SOURCE
      language: input.language || "ua",
      patterns,
    });

    update("proposalAgent", "done");

    // =========================
    // RESULT
    // =========================
    return {
      // analysis
      requirements: analysis.requirements,
      nonFunctional: analysis.nonFunctional,
      integrations: analysis.integrations,
      actors: analysis.actors,
      constraints: analysis.constraints,

      // contract + system
      contract,
      system: systemModel,

      // patterns
      patterns,

      // modeling
      pbs,
      dependencies,

      // architecture
      domainModel,
      architecture,
      database,
      api,

      // orchestration debug
      orchestration,

      // validation
      validation,

      // planning
      traceability,
      estimation,
      projectPlan,

      // 🔥 unified model (важливо для дебагу)
      unifiedModel,

      // final document
      proposal,
    };
  } catch (error) {
    update("pipeline", "failed");
    throw error;
  }
}

module.exports = runTenderPipeline;
