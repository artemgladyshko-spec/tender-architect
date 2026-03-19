Return STRICT JSON.

Analyze contract-related content.

INPUT:
attachments

OUTPUT:

{
  "engagement_model": "fixed_price | time_material | mixed",
  "phases": [],
  "milestones": [],
  "timeline_constraints": [],
  "delivery_model": "phased | big_bang",
  "risks": []
}

Rules:

- Extract only what is explicitly present
- No assumptions
- JSON only