Step 1 - Analyze tender documentation

Step 2 - Detect actors

Output:
data/outputs/actors

Step 3 - Detect architecture patterns

Input:
data/outputs/analysis/requirements.md

Prompt:
ai/prompts/architecture_pattern_detector.md

Output:
data/outputs/analysis/architecture_patterns.md

Step 4 - Generate PBS

Input:
requirements + actors

Output:
data/outputs/pbs

Step 5 - Generate UI prototype

Input:
PBS

Output:
data/outputs/prototype

Step 6 - Generate domain model

Input:
PBS + prototype + actors

Output:
data/outputs/domain_model

Step 7 - Generate architecture

Step 8 - Generate database design

Step 9 - Generate API design

Step 10 - Map non-functional requirements

Output:
data/outputs/nfr

Step 11 - Generate estimation

Step 12 - Generate traceability

Step 13 - Generate final proposal
