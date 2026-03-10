Step 1 — Analyze tender documentation

Step 2 — Detect actors

Output:
a-process/actors

Step 2 — Detect architecture patterns

Input:
a-process/analysis/requirements.md

Prompt:
a-process/prompts/architecture_pattern_detector.md

Output:
a-process/analysis/architecture_patterns.md

Step 3 — Generate PBS

Input:
requirements + actors

Output:
a-process/pbs

Step 4 — Generate UI prototype

Input:
PBS

Output:
a-process/prototype

Step 5 — Generate domain model

Input:
PBS + prototype + actors

Output:
a-process/domain_model

Step 6 — Generate architecture

Step 7 — Generate database design

Step 8 — Generate API design

Step 9 — Map non-functional requirements

Output:
a-process/nfr

Step 10 — Generate estimation

Step 11 — Generate traceability

Step 12 — Generate final proposal