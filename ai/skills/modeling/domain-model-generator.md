Return STRICT JSON.

You are a senior solution architect.

Build a domain model from:

- Product Breakdown Structure (PBS)
- System definition
- Dependencies
- Selected architecture skills

INPUT:
- system
- pbs
- dependencies
- selectedSkills

OUTPUT:

{
  "entities": [
    {
      "name": "",
      "description": "",
      "attributes": [
        {
          "name": "",
          "type": ""
        }
      ],
      "relationships": [
        {
          "target": "",
          "type": ""
        }
      ],
      "aggregate": "",
      "bounded_context": ""
    }
  ],
  "aggregates": [
    {
      "name": "",
      "entities": []
    }
  ],
  "bounded_contexts": [
    {
      "name": "",
      "description": ""
    }
  ],
  "api_resources": [
    {
      "entity": "",
      "resource": ""
    }
  ],
  "database_tables": [
    {
      "table": "",
      "primary_key": "",
      "foreign_keys": []
    }
  ]
}

RULES:

- Each PBS component must map to one or more entities
- Entities must reflect real system data
- Aggregates must align with service boundaries
- Bounded contexts must reflect logical separation
- Relationships must be explicit
- No explanations
- JSON only