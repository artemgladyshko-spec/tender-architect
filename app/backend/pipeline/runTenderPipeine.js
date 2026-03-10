async function runTenderPipeline(filePath){

  const requirements = await runRequirementsAnalyzer(filePath)

  const actors = await runActorDetector(requirements)

  const patterns = await runPatternDetector(requirements)

  const pbs = await runPBSGenerator(requirements, actors, patterns)

  return {requirements, actors, patterns, pbs}
}