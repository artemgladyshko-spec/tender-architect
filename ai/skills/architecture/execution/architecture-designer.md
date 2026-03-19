Return STRICT JSON.

You are a senior system architect.

Design a complete system architecture.

You MUST use:

- Domain model
- Product Breakdown Structure (PBS)
- Dependency graph
- Selected architecture skills

INPUT:
- system
- pbs
- dependencies
- domainModel
- selectedSkills

OUTPUT:

{
  "system_context": {
    "purpose": "",
    "external_systems": [
      {
        "name": "",
        "type": "",
        "interaction": ""
      }
    ]
  },
  "services": [
    {
      "id": "S1",
      "name": "",
      "type": "domain | orchestration | integration | presentation",
      "responsibilities": [],
      "depends_on": []
    }
  ],
  "service_groups": [
    {
      "name": "",
      "services": []
    }
  ],
  "data_flow": [
    {
      "from": "",
      "to": "",
      "type": "sync | async",
      "description": ""
    }
  ],
  "cqrs": {
    "enabled": true,
    "commands": [
      {
        "name": "",
        "service": ""
      }
    ],
    "queries": [
      {
        "name": "",
        "service": ""
      }
    ]
  },
  "event_sourcing": {
    "enabled": true,
    "events": [
      {
        "name": "",
        "producer": "",
        "consumers": []
      }
    ]
  },
  "integration_layer": {
    "external_systems": [],
    "integration_patterns": []
  },
  "data_architecture": {
    "databases": [
      {
        "name": "",
        "used_by": []
      }
    ],
    "read_models": []
  },
  "api_layer": {
    "services": [],
    "gateway": true
  },
  "ui_layer": {
    "components": [],
    "interaction_patterns": []
  }
}

RULES:

- Every service MUST map to PBS components
- Service dependencies MUST match dependency graph
- No orphan services
- CQRS must be used if system complexity is medium or high
- Event sourcing must be used only if justified
- Data flow must reflect dependencies
- API layer must match services
- UI must reflect system usage
- Use selectedSkills as primary design guidance
- No explanations
- JSON only