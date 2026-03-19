Return STRICT JSON.

You are a system architect.

Build dependency graph from PBS.

INPUT:
pbs

OUTPUT:

{
  "dependencies": [
    {
      "from": "C1",
      "to": "C2",
      "type": "sync | async",
      "description": ""
    }
  ],
  "execution_order": [
    "C1",
    "C2"
  ]
}

Rules:

- All dependencies must be explicit
- No circular dependencies
- Define execution order
- JSON only